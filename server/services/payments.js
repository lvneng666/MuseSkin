import { pool } from '../db/pool.js';
import { httpError } from '../utils/httpError.js';
import { sendPaymentReceivedEmail } from './email.js';

/**
 * Single "payment confirmed" path shared by:
 *   - PayPal capture (client redirect)
 *   - PayPal webhook (backup)
 *   - admin manual Western Union confirmation
 *
 * Sets the order paid/confirmed, decrements stock (locking product rows to
 * prevent overselling), and emails the customer. Idempotent: an already-paid
 * order returns early.
 */
export async function finalizeOrderPayment({ orderNo, paypalOrderId = null, paypalCaptureId = null }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT * FROM orders WHERE order_no = $1 FOR UPDATE', [orderNo]);
    if (rows.length === 0) throw httpError(404, 'Order not found');
    const order = rows[0];

    if (order.payment_status === 'paid') return order; // idempotent

    const { rows: itemRows } = await client.query(
      'SELECT product_id, slug, title_en, quantity FROM order_items WHERE order_id = $1',
      [order.id]
    );
    if (itemRows.length > 0) {
      const ids = itemRows.map((i) => i.product_id).filter(Boolean);
      if (ids.length > 0) {
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
        await client.query(`SELECT id FROM products WHERE id IN (${placeholders}) FOR UPDATE`, ids);
      }
      for (const item of itemRows) {
        const { rows: stockRows } = await client.query(
          'SELECT stock FROM products WHERE id = $1',
          [item.product_id]
        );
        if (stockRows.length > 0 && stockRows[0].stock < item.quantity) {
          throw httpError(409, `Insufficient stock for ${item.title_en}`);
        }
        if (item.product_id) {
          await client.query(
            'UPDATE products SET stock = GREATEST(stock - $1, 0) WHERE id = $2',
            [item.quantity, item.product_id]
          );
        }
      }
    }

    await client.query(
      `UPDATE orders
       SET payment_status = 'paid', order_status = 'confirmed', paid_at = now(), updated_at = now(),
           paypal_order_id = COALESCE($2, paypal_order_id),
           paypal_capture_id = COALESCE($3, paypal_capture_id)
       WHERE id = $1`,
      [order.id, paypalOrderId, paypalCaptureId]
    );

    await client.query('COMMIT');

    // Fire-and-forget (email service catches its own errors) after commit.
    sendPaymentReceivedEmail({ ...order, payment_status: 'paid', order_status: 'confirmed' });
    return { ...order, payment_status: 'paid', order_status: 'confirmed' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
