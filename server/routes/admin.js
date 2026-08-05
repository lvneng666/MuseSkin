import { Router } from 'express';
import { z } from 'zod';
import path from 'node:path';
import { pool } from '../db/pool.js';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import { UPLOAD_DIR } from '../utils/uploadsDir.js';
import { finalizeOrderPayment } from '../services/payments.js';
import { sendOrderShippedEmail } from '../services/email.js';

const router = Router();

// Every /api/admin/* route requires an admin session.
router.use(requireAdmin);

const PRODUCT_FIELDS = `
  id, slug, title_en, title_cn, category, category_en, category_cn,
  desc_en, desc_cn, grid_desc_en, grid_desc_cn, tag_en, tag_cn,
  active_en, active_cn, skin_en, skin_cn, usage_en, usage_cn,
  moq_en, moq_cn, ritual_categories, ritual_desc_en, ritual_desc_cn,
  ritual_tag_en, ritual_tag_cn, price_cents, stock, image_url,
  status, featured, sort_order
`;

const productSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, numbers, dashes'),
  title_en: z.string().min(1, 'English title required'),
  title_cn: z.string().min(1, 'Chinese title required'),
  category: z.enum(['face', 'body', 'protection']),
  category_en: z.string().min(1),
  category_cn: z.string().min(1),
  desc_en: z.string().min(1),
  desc_cn: z.string().min(1),
  grid_desc_en: z.string().nullable().optional(),
  grid_desc_cn: z.string().nullable().optional(),
  tag_en: z.string().min(1),
  tag_cn: z.string().min(1),
  active_en: z.string().min(1),
  active_cn: z.string().min(1),
  skin_en: z.string().min(1),
  skin_cn: z.string().min(1),
  usage_en: z.string().min(1),
  usage_cn: z.string().min(1),
  moq_en: z.string().default('Daily ritual'),
  moq_cn: z.string().default('日常护理'),
  ritual_categories: z.string().default(''),
  ritual_desc_en: z.string().default(''),
  ritual_desc_cn: z.string().default(''),
  ritual_tag_en: z.string().default(''),
  ritual_tag_cn: z.string().default(''),
  price_cents: z.number().int().min(0),
  stock: z.number().int().min(0),
  image_url: z.string().min(1),
  status: z.enum(['active', 'inactive']).default('active'),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

// ---- Products ----

router.get('/products', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${PRODUCT_FIELDS} FROM products ORDER BY sort_order ASC, title_en ASC`
    );
    res.json({ products: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/products', validate(productSchema), async (req, res, next) => {
  try {
    const body = req.body;
    const columns = Object.keys(body);
    const values = columns.map((c) => body[c]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const updates = columns.map((c) => `${c} = EXCLUDED.${c}`).join(', ');
    const { rows } = await pool.query(
      `INSERT INTO products (${columns.join(', ')})
       VALUES (${placeholders})
       ON CONFLICT (slug) DO UPDATE SET ${updates}
       RETURNING *`,
      values
    );
    res.status(201).json({ product: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id', validate(productSchema.partial()), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = req.body;
    if (Object.keys(body).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    const columns = Object.keys(body);
    const sets = columns.map((c, i) => `${c} = $${i + 1}`);
    const values = columns.map((c) => body[c]);
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE products SET ${sets.join(', ')}, updated_at = now()
       WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ---- Dashboard stats ----

router.get('/stats', async (req, res, next) => {
  try {
    const [total, revenue, today, pendingWu, newInq, lowStock] = await Promise.all([
      pool.query('SELECT count(*)::int AS n FROM orders'),
      pool.query(`SELECT COALESCE(sum(total_cents), 0)::int AS n FROM orders WHERE payment_status = 'paid'`),
      pool.query(`SELECT count(*)::int AS n FROM orders WHERE placed_at::date = current_date`),
      pool.query(`SELECT count(*)::int AS n FROM orders WHERE payment_status = 'awaiting_confirmation'`),
      pool.query(`SELECT count(*)::int AS n FROM inquiries WHERE status = 'new'`),
      pool.query(`SELECT count(*)::int AS n FROM products WHERE status = 'active' AND stock <= 5`),
    ]);
    res.json({
      total_orders: total.rows[0].n,
      revenue_cents_paid: revenue.rows[0].n,
      orders_today: today.rows[0].n,
      pending_wu: pendingWu.rows[0].n,
      new_inquiries: newInq.rows[0].n,
      low_stock_items: lowStock.rows[0].n,
    });
  } catch (err) {
    next(err);
  }
});

// ---- Orders ----

router.get('/orders', async (req, res, next) => {
  try {
    const { order_status, payment_status, q } = req.query;
    const params = [];
    let sql = 'SELECT * FROM orders WHERE 1=1';
    if (order_status) {
      params.push(order_status);
      sql += ` AND order_status = $${params.length}`;
    }
    if (payment_status) {
      params.push(payment_status);
      sql += ` AND payment_status = $${params.length}`;
    }
    if (q) {
      params.push(`%${q}%`);
      sql += ` AND (customer_email ILIKE $${params.length} OR order_no ILIKE $${params.length})`;
    }
    sql += ' ORDER BY placed_at DESC LIMIT 200';
    const { rows } = await pool.query(sql, params);
    res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/orders/:orderNo', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE order_no = $1', [req.params.orderNo.toUpperCase()]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id', [order.id]);
    res.json({ order, items });
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:orderNo/status', validate(z.object({
  order_status: z.enum(['confirmed', 'shipped', 'completed', 'cancelled']),
})), async (req, res, next) => {
  try {
    const orderNo = req.params.orderNo.toUpperCase();
    const { rows } = await pool.query('SELECT * FROM orders WHERE order_no = $1', [orderNo]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    const target = req.body.order_status;

    if (target === 'shipped') {
      if (order.order_status !== 'confirmed') return res.status(400).json({ error: 'Can only ship a confirmed order' });
      await pool.query(
        `UPDATE orders SET order_status = 'shipped', shipped_at = now(), updated_at = now() WHERE id = $1`,
        [order.id]
      );
    } else if (target === 'completed') {
      if (order.order_status !== 'shipped') return res.status(400).json({ error: 'Can only complete a shipped order' });
      await pool.query(`UPDATE orders SET order_status = 'completed', updated_at = now() WHERE id = $1`, [order.id]);
    } else if (target === 'cancelled') {
      if (['completed', 'cancelled'].includes(order.order_status)) {
        return res.status(400).json({ error: 'Order is already final' });
      }
      const newPayment = order.payment_status === 'paid' ? order.payment_status : 'cancelled';
      await pool.query(
        `UPDATE orders SET order_status = 'cancelled', payment_status = $2, updated_at = now() WHERE id = $1`,
        [order.id, newPayment]
      );
    } else if (target === 'confirmed') {
      await pool.query(`UPDATE orders SET order_status = 'confirmed', updated_at = now() WHERE id = $1`, [order.id]);
    }

    const { rows: updated } = await pool.query('SELECT * FROM orders WHERE id = $1', [order.id]);
    if (target === 'shipped') sendOrderShippedEmail(updated[0]);
    res.json({ order: updated[0] });
  } catch (err) {
    next(err);
  }
});

// ---- Inquiries ----

router.get('/inquiries', async (req, res, next) => {
  try {
    const { status } = req.query;
    const params = [];
    let sql = 'SELECT * FROM inquiries';
    if (status) {
      params.push(status);
      sql += ' WHERE status = $1';
    }
    sql += ' ORDER BY created_at DESC LIMIT 200';
    const { rows } = await pool.query(sql, params);
    res.json({ inquiries: rows });
  } catch (err) {
    next(err);
  }
});

router.patch('/inquiries/:id', validate(z.object({
  status: z.enum(['new', 'resolved']),
})), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *',
      [req.body.status, Number(req.params.id)]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Inquiry not found' });
    res.json({ inquiry: rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * Manual Western Union confirmation: mark paid + confirmed, decrement stock,
 * email the customer — the same finalize path used by PayPal.
 */
router.post('/orders/:orderNo/mark-paid', async (req, res, next) => {
  try {
    const orderNo = req.params.orderNo.toUpperCase();
    const { rows } = await pool.query('SELECT * FROM orders WHERE order_no = $1', [orderNo]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    if (order.payment_method !== 'western_union') {
      return res.status(400).json({ error: 'Only Western Union orders can be manually marked paid' });
    }
    if (order.payment_status === 'paid') return res.json({ order, already: true });

    await finalizeOrderPayment({ orderNo });
    const { rows: updated } = await pool.query('SELECT * FROM orders WHERE id = $1', [order.id]);
    res.json({ order: updated[0] });
  } catch (err) {
    next(err);
  }
});

/** Serve an uploaded Western Union receipt to an admin (never publicly). */
router.get('/receipts/:file', (req, res, next) => {
  const file = path.basename(req.params.file); // block path traversal
  res.sendFile(path.join(UPLOAD_DIR, file), (err) => err && next());
});

/** Soft-delete: flip to inactive so historical orders keep their snapshots. */
router.delete('/products/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE products SET status = 'inactive', updated_at = now()
       WHERE id = $1 RETURNING id`,
      [Number(req.params.id)]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
