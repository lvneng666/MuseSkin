import nodemailer from 'nodemailer';
import { pool } from '../db/pool.js';
import { CONFIG } from '../config/env.js';
import {
  buildPaymentReceivedHtml,
  buildOrderConfirmationHtml,
  buildOrderShippedHtml,
  buildInquiryNotificationHtml,
} from './emailTemplates.js';

// SMTP is optional — when unset, emails are logged to stdout so the whole
// system stays testable before real credentials exist.
let transporter = null;
if (CONFIG.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: CONFIG.SMTP_HOST,
    port: CONFIG.SMTP_PORT,
    secure: CONFIG.SMTP_SECURE,
    auth: CONFIG.SMTP_USER ? { user: CONFIG.SMTP_USER, pass: CONFIG.SMTP_PASS } : undefined,
  });
}

export async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    // eslint-disable-next-line no-console
    console.log(`[mail:disabled] to=${to} subject=${subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: CONFIG.MAIL_FROM, to, subject, html });
    // eslint-disable-next-line no-console
    console.log(`[mail:sent] to=${to} subject=${subject}`);
  } catch (err) {
    // Email must never crash a request — log and continue.
    // eslint-disable-next-line no-console
    console.error('[mail:error]', err.message);
  }
}

export async function sendResetPasswordEmail(to, token) {
  const url = `${CONFIG.BASE_URL}/reset-password?token=${token}`;
  await sendEmail({
    to,
    subject: 'Reset your Peaffee password',
    html: `<p>We received a request to reset your Peaffee account password.</p>
           <p>Click the link below to choose a new password (valid for 1 hour):</p>
           <p><a href="${url}">${url}</a></p>
           <p>If you didn't request this, you can safely ignore this email.</p>`,
  });
}

export async function sendPaymentReceivedEmail(order) {
  try {
    const { rows } = await pool.query(
      'SELECT title_en, unit_price_cents, quantity, line_total_cents FROM order_items WHERE order_id = $1',
      [order.id]
    );
    const html = buildPaymentReceivedHtml(order, rows);
    await sendEmail({
      to: order.customer_email,
      subject: `Payment received — order ${order.order_no}`,
      html,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[mail:error]', err.message);
  }
}

export async function sendOrderConfirmationEmail(order, items) {
  try {
    const html = buildOrderConfirmationHtml(order, items, order.payment_method === 'western_union');
    await sendEmail({
      to: order.customer_email,
      subject: `Order ${order.order_no} received`,
      html,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[mail:error]', err.message);
  }
}

export async function sendOrderShippedEmail(order) {
  try {
    const html = buildOrderShippedHtml(order);
    await sendEmail({
      to: order.customer_email,
      subject: `Your order ${order.order_no} is on its way`,
      html,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[mail:error]', err.message);
  }
}

export async function sendInquiryNotificationEmail(inquiry) {
  const to = CONFIG.ADMIN_NOTIFY_EMAIL || CONFIG.MAIL_FROM;
  if (!to) return;
  try {
    const html = buildInquiryNotificationHtml(inquiry);
    await sendEmail({
      to,
      subject: `New care inquiry — ${inquiry.name}`,
      html,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[mail:error]', err.message);
  }
}
