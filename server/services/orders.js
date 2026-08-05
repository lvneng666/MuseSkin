import { pool } from '../db/pool.js';
import { generateOrderNo } from './orderNumber.js';
import { httpError } from '../utils/httpError.js';
import { CONFIG } from '../config/env.js';

/**
 * Create an order + its items in ONE transaction. Stock is only validated here
 * (must exist and have enough); it is DECREMENTED later, in the payment-confirm
 * transaction (services/payments.js finalizeOrderPayment).
 */
export async function createOrder({ payment_method, customer, items, userId = null }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const slugs = items.map((i) => i.slug);
    const placeholders = slugs.map((_, i) => `$${i + 1}`).join(', ');
    const { rows: productRows } = await client.query(
      `SELECT id, slug, title_en, title_cn, price_cents, stock, image_url
       FROM products
       WHERE slug IN (${placeholders}) AND status = 'active'`,
      slugs
    );
    const products = new Map(productRows.map((p) => [p.slug, p]));

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = products.get(item.slug);
      if (!product) throw httpError(400, `Unknown or unavailable product: ${item.slug}`);
      if (product.stock < item.quantity) {
        throw httpError(409, `Not enough stock for ${product.title_en}`);
      }
      const lineTotal = product.price_cents * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        product_id: product.id,
        slug: product.slug,
        title_en: product.title_en,
        title_cn: product.title_cn,
        unit_price_cents: product.price_cents,
        quantity: item.quantity,
        line_total_cents: lineTotal,
        image_url: product.image_url,
      });
    }

    const paymentStatus = payment_method === 'western_union' ? 'awaiting_confirmation' : 'pending';
    const orderNo = generateOrderNo();

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders
        (order_no, user_id, customer_name, customer_email, country, shipping_address,
         payment_method, payment_status, items_subtotal_cents, shipping_cents, total_cents, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, 'USD')
       RETURNING *`,
      [orderNo, userId, customer.name, customer.email, customer.country, customer.address,
       payment_method, paymentStatus, subtotal, subtotal]
    );

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items
          (order_id, product_id, slug, title_en, title_cn, unit_price_cents, quantity, line_total_cents, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [orderRows[0].id, item.product_id, item.slug, item.title_en, item.title_cn,
         item.unit_price_cents, item.quantity, item.line_total_cents, item.image_url]
      );
    }

    await client.query('COMMIT');
    return orderRows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Western Union receiving instructions shown to the customer. */
export function getWuInstructions(totalCents) {
  return {
    beneficiary: CONFIG.WU_BENEFICIARY || 'Peaffee',
    bank: CONFIG.WU_BANK || '',
    account: CONFIG.WU_ACCOUNT || '',
    swift: CONFIG.WU_SWIFT || '',
    currency: CONFIG.WU_CURRENCY || 'USD',
    amount: (totalCents / 100).toFixed(2),
  };
}
