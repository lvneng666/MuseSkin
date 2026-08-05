import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pool } from '../db/pool.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { orderLimiter } from '../middleware/rateLimit.js';
import { createOrder, getWuInstructions } from '../services/orders.js';
import { UPLOAD_DIR } from '../utils/uploadsDir.js';
import { httpError } from '../utils/httpError.js';
import { sendOrderConfirmationEmail } from '../services/email.js';
import { CONFIG } from '../config/env.js';

const router = Router();

const orderSchema = z.object({
  payment_method: z.enum(['paypal', 'western_union']),
  customer: z.object({
    name: z.string().min(1, 'Name is required').max(120),
    email: z.string().email('Valid email required'),
    country: z.string().min(1, 'Country is required').max(120),
    address: z.string().min(1, 'Shipping address is required').max(500),
  }),
  items: z
    .array(z.object({
      slug: z.string().min(1),
      quantity: z.number().int().min(1).max(99),
    }))
    .min(1, 'Order must contain at least one item')
    .max(50),
});

/** Create an order (guest or logged-in). Writes orders + items in one transaction. */
router.post('/', orderLimiter, validate(orderSchema), async (req, res, next) => {
  const userId = req.user?.id || null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const order = await createOrder({ ...req.body, userId });
      const items = await getOrderItems(order.id);
      sendOrderConfirmationEmail(order, items);
      const payload = {
        order_no: order.order_no,
        id: order.id,
        customer_email: order.customer_email,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        total_cents: order.total_cents,
      };
      if (order.payment_method === 'western_union') {
        payload.wu_instructions = getWuInstructions(order.total_cents);
      } else {
        payload.paypal_client_id = CONFIG.PAYPAL_CLIENT_ID || null;
      }
      return res.status(201).json(payload);
    } catch (err) {
      // Order-number collision — retry with a fresh number.
      if (err.code === '23505' && err.constraint === 'orders_order_no_key') continue;
      return next(err);
    }
  }
  return next(new Error('Could not allocate an order number'));
});

/** Guest order lookup by email + order number. */
router.get('/lookup', async (req, res, next) => {
  try {
    const { email, order_no } = req.query;
    if (!email || !order_no) return res.status(400).json({ error: 'email and order_no are required' });
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE customer_email = $1 AND order_no = $2`,
      [String(email).trim().toLowerCase(), String(order_no).trim().toUpperCase()]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    const items = await getOrderItems(order.id);
    res.json({ order, items });
  } catch (err) {
    next(err);
  }
});

/** Current user's orders. */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC`,
      [req.user.id]
    );
    res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
});

/** A logged-in user's own order detail. */
router.get('/:orderNo', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE order_no = $1 AND user_id = $2`,
      [req.params.orderNo.toUpperCase(), req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    const items = await getOrderItems(order.id);
    res.json({ order, items });
  } catch (err) {
    next(err);
  }
});

async function getOrderItems(orderId) {
  const { rows } = await pool.query(
    `SELECT slug, title_en, title_cn, unit_price_cents, quantity, line_total_cents, image_url
     FROM order_items WHERE order_id = $1 ORDER BY id`,
    [orderId]
  );
  return rows;
}

/* ---- Western Union receipt upload (multipart, ≤ 5 MB, image/PDF) ---- */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10) || '.jpg';
    cb(null, `wu-${req.params.orderNo}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype) || file.mimetype === 'application/pdf') cb(null, true);
    else cb(httpError(400, 'Only image or PDF receipts are allowed'));
  },
});

router.post('/:orderNo/wu-receipt', orderLimiter, upload.single('receipt'), async (req, res, next) => {
  try {
    const orderNo = req.params.orderNo.toUpperCase();
    const { rows } = await pool.query('SELECT * FROM orders WHERE order_no = $1', [orderNo]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    if (order.payment_method !== 'western_union') {
      return res.status(400).json({ error: 'This order is not a Western Union order' });
    }
    if (order.payment_status === 'paid') {
      return res.status(400).json({ error: 'Order is already paid' });
    }
    const email = (req.body?.email || '').trim().toLowerCase();
    if (email && order.customer_email.toLowerCase() !== email) {
      return res.status(403).json({ error: 'Email does not match this order' });
    }

    const wuReference = (req.body?.wu_reference || '').trim().slice(0, 200);
    const receiptPath = req.file ? `/uploads/${req.file.filename}` : order.wu_receipt_path;

    await pool.query(
      `UPDATE orders
       SET wu_reference = COALESCE($1, wu_reference),
           wu_receipt_path = COALESCE($2, wu_receipt_path),
           updated_at = now()
       WHERE id = $3`,
      [wuReference || null, receiptPath, order.id]
    );
    res.json({ ok: true, payment_status: order.payment_status });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
});

export default router;
