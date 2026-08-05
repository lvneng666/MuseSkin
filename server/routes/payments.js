import { Router } from 'express';
import express from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { validate } from '../middleware/validate.js';
import { webhookLimiter } from '../middleware/rateLimit.js';
import { CONFIG } from '../config/env.js';
import { httpError } from '../utils/httpError.js';
import { createPayPalOrder, capturePayPalOrder, verifyWebhook } from '../services/paypal.js';
import { finalizeOrderPayment } from '../services/payments.js';

const router = Router();

/* ---------------- PayPal ---------------- */

router.post('/paypal/create-order', validate(z.object({
  order_id: z.number().int().positive(),
})), async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.body.order_id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    if (order.payment_status !== 'pending') {
      return res.status(400).json({ error: 'Order is not payable' });
    }
    if (!CONFIG.PAYPAL_CLIENT_ID) {
      return res.status(503).json({ error: 'Online payment is not configured yet' });
    }
    const created = await createPayPalOrder({
      orderNo: order.order_no,
      amountCents: order.total_cents,
      currency: order.currency,
    });
    await pool.query('UPDATE orders SET paypal_order_id = $1, updated_at = now() WHERE id = $2', [created.paypal_order_id, order.id]);
    res.json({ paypal_order_id: created.paypal_order_id });
  } catch (err) {
    next(err);
  }
});

router.post('/paypal/capture', validate(z.object({
  order_no: z.string().min(1),
  paypal_order_id: z.string().min(1),
})), async (req, res, next) => {
  try {
    const orderNo = req.body.order_no.toUpperCase();
    const { rows } = await pool.query('SELECT * FROM orders WHERE order_no = $1', [orderNo]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    if (order.paypal_order_id !== req.body.paypal_order_id) {
      return res.status(400).json({ error: 'PayPal order id does not match' });
    }

    const data = await capturePayPalOrder(req.body.paypal_order_id);
    const purchaseUnit = data.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];

    if (!capture || data.status !== 'COMPLETED') {
      throw httpError(400, `Payment was not completed (${data.status || 'unknown status'})`);
    }
    if (Math.round(parseFloat(capture.amount?.value || '0') * 100) !== order.total_cents) {
      throw httpError(400, 'Payment amount does not match order total');
    }

    const finalized = await finalizeOrderPayment({
      orderNo,
      paypalOrderId: order.paypal_order_id,
      paypalCaptureId: capture.id,
    });
    res.json({
      ok: true,
      order_no: orderNo,
      payment_status: finalized.payment_status,
      order_status: finalized.order_status,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/paypal/webhook', webhookLimiter, express.raw({ type: 'application/json' }), async (req, res) => {
  // Always acknowledge quickly (PayPal retries on non-2xx). Unconfigured
  // webhook id means the capture endpoint is the source of truth.
  try {
    const rawBody = req.body.toString('utf8');
    if (!CONFIG.PAYPAL_WEBHOOK_ID) return res.status(200).json({ received: true });

    const valid = await verifyWebhook(req.headers, rawBody);
    if (!valid) return res.status(400).json({ error: 'Invalid webhook signature' });

    const event = JSON.parse(rawBody);
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderNo = event.resource?.custom_id;
      if (orderNo && orderNo.startsWith('PF-')) {
        try {
          await finalizeOrderPayment({ orderNo, paypalCaptureId: event.resource.id });
        } catch {
          // Already paid (idempotent) or stock issue — the capture endpoint
          // already handled it; webhook is only a backup.
        }
      }
    }
    res.status(200).json({ received: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[webhook]', err.message);
    res.status(200).json({ received: true });
  }
});

export default router;
