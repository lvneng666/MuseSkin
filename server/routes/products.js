import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

const PRODUCT_FIELDS = `
  id, slug, title_en, title_cn, category, category_en, category_cn,
  desc_en, desc_cn, grid_desc_en, grid_desc_cn, tag_en, tag_cn,
  active_en, active_cn, skin_en, skin_cn, usage_en, usage_cn,
  moq_en, moq_cn, ritual_categories, ritual_desc_en, ritual_desc_cn,
  ritual_tag_en, ritual_tag_cn, price_cents, stock, image_url, featured, sort_order
`;

/** Public product list — active products only, optionally filtered by category. */
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    let sql = `SELECT ${PRODUCT_FIELDS} FROM products WHERE status = 'active'`;
    const params = [];
    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }
    sql += ' ORDER BY sort_order ASC, title_en ASC';
    const { rows } = await pool.query(sql, params);
    res.json({ products: rows });
  } catch (err) {
    next(err);
  }
});

/** Public product detail by slug. */
router.get('/:slug', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${PRODUCT_FIELDS} FROM products WHERE slug = $1 AND status = 'active'`,
      [req.params.slug]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
