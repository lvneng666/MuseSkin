import { CONFIG } from '../config/env.js';

const money = (cents) => `$${(cents / 100).toFixed(2)}`;

/** Shared minimal HTML email shell. */
export function layout({ title, content }) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:Georgia,'Times New Roman',serif;color:#1f1f1f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:30px 10px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:10px;overflow:hidden;">
        <tr><td style="background:#1f1f1f;color:#fff;padding:22px 30px;font-size:18px;letter-spacing:2px;">PEAFFEE</td></tr>
        <tr><td style="padding:30px;">
          <h1 style="margin:0 0 18px;font-size:22px;font-weight:normal;">${title}</h1>
          ${content}
          <p style="margin-top:28px;color:#8a8a8a;font-size:12px;">Peaffee — botanical skincare for a slower, more thoughtful daily ritual.<br>Questions? Reply to this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function itemTable(order, items) {
  const rows = items
    .map((i) => `
      <tr>
        <td style="padding:8px 0;color:#1f1f1f;">${i.title_en}</td>
        <td align="center" style="padding:8px 0;">${i.quantity}</td>
        <td align="right" style="padding:8px 0;font-weight:bold;">${money(i.line_total_cents)}</td>
      </tr>`)
    .join('');
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;border-top:1px solid #eee;">
      <tr>
        <th align="left" style="padding:8px 0;border-bottom:1px solid #eee;">Item</th>
        <th align="center" style="padding:8px 0;border-bottom:1px solid #eee;">Qty</th>
        <th align="right" style="padding:8px 0;border-bottom:1px solid #eee;">Total</th>
      </tr>
      ${rows}
      <tr><td colspan="2" align="right" style="padding:10px 0;font-weight:bold;">Total</td>
      <td align="right" style="padding:10px 0;font-weight:bold;">${money(order.total_cents)} ${order.currency}</td></tr>
    </table>`;
}

export function buildPaymentReceivedHtml(order, items) {
  return layout({
    title: `Payment received — order ${order.order_no}`,
    content: `
      <p>Hi ${order.customer_name},</p>
      <p>Thank you! We have received your payment of <strong>${money(order.total_cents)} ${order.currency}</strong> for order <strong>${order.order_no}</strong>.</p>
      ${itemTable(order, items)}
      <p>We are preparing your order and will email you with shipping details once it's on its way.</p>
      <p>— The Peaffee care team</p>`,
  });
}

export function buildOrderConfirmationHtml(order, items, isWu) {
  const paymentNote = isWu
    ? `To complete your order, please transfer <strong>${money(order.total_cents)} ${order.currency}</strong> with reference <strong>${order.order_no}</strong> — we will confirm once it arrives.`
    : 'You will be redirected to complete payment securely.';
  return layout({
    title: `Order ${order.order_no} received`,
    content: `
      <p>Hi ${order.customer_name},</p>
      <p>Thanks for choosing Peaffee. Here is a summary of your order:</p>
      ${itemTable(order, items)}
      <p><strong>Shipping to:</strong><br>${order.customer_name}<br>${order.country}<br>${order.shipping_address}</p>
      <p>${paymentNote}</p>
      <p>— The Peaffee care team</p>`,
  });
}

export function buildOrderShippedHtml(order) {
  return layout({
    title: `Your order ${order.order_no} is on its way`,
    content: `
      <p>Hi ${order.customer_name},</p>
      <p>Good news — your Peaffee order <strong>${order.order_no}</strong> has been shipped.</p>
      <p>We'll keep you posted. In the meantime, enjoy your ritual.</p>
      <p>— The Peaffee care team</p>`,
  });
}

export function buildInquiryNotificationHtml(inquiry) {
  return layout({
    title: `New care inquiry from ${inquiry.name}`,
    content: `
      <p>A new inquiry arrived on the Peaffee site:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;border-top:1px solid #eee;">
        <tr><td style="padding:6px 0;color:#8a8a8a;width:90px;">Name</td><td style="padding:6px 0;">${inquiry.name}</td></tr>
        <tr><td style="padding:6px 0;color:#8a8a8a;">Email</td><td style="padding:6px 0;">${inquiry.email}</td></tr>
        ${inquiry.interest ? `<tr><td style="padding:6px 0;color:#8a8a8a;">Interest</td><td style="padding:6px 0;">${inquiry.interest}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#8a8a8a;vertical-align:top;">Message</td><td style="padding:6px 0;">${inquiry.message}</td></tr>
      </table>
      <p><a href="${CONFIG.BASE_URL}/admin#/inquiries" style="color:#a8835c;">Open the admin inbox</a></p>`,
  });
}
