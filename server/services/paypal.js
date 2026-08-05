import { CONFIG } from '../config/env.js';

/**
 * Minimal PayPal REST v2 client (raw fetch — the official SDK is unmaintained).
 * Covers exactly what checkout needs: create order, capture, webhook verify.
 */
const API_BASE = CONFIG.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

let tokenCache = { token: null, expiresAt: 0 };

async function getAccessToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) return tokenCache.token;
  if (!CONFIG.PAYPAL_CLIENT_ID || !CONFIG.PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal is not configured (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET)');
  }
  const auth = Buffer.from(`${CONFIG.PAYPAL_CLIENT_ID}:${CONFIG.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status})`);
  const data = await res.json();
  tokenCache = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

async function paypalFetch(pathname, { method = 'GET', body } = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal ${method} ${pathname} failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Create a PayPal order. `custom_id` carries our order_no so the webhook can
 * map a capture event back to our order.
 */
export async function createPayPalOrder({ orderNo, amountCents, currency }) {
  const data = await paypalFetch('/v2/checkout/orders', {
    method: 'POST',
    body: {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderNo,
        custom_id: orderNo,
        amount: { currency_code: currency, value: (amountCents / 100).toFixed(2) },
      }],
    },
  });
  return { paypal_order_id: data.id, status: data.status };
}

/** Capture a previously approved order. */
export async function capturePayPalOrder(paypalOrderId) {
  return paypalFetch(`/v2/checkout/orders/${paypalOrderId}/capture`, { method: 'POST' });
}

/** Verify a PayPal webhook signature. `headers` = req.headers, `rawBody` = verbatim request body. */
export async function verifyWebhook(headers, rawBody) {
  if (!CONFIG.PAYPAL_WEBHOOK_ID) return false;
  const payload = {
    auth_algo: headers['paypal-auth-algo'],
    cert_url: headers['paypal-cert-url'],
    transmission_id: headers['paypal-transmission-id'],
    transmission_sig: headers['paypal-transmission-sig'],
    transmission_time: headers['paypal-transmission-time'],
    webhook_id: CONFIG.PAYPAL_WEBHOOK_ID,
    webhook_event: rawBody,
  };
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.verification_status === 'SUCCESS';
}
