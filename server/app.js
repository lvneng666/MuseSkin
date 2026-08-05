import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import helmet from 'helmet';
import { pool } from './db/pool.js';
import { CONFIG } from './config/env.js';
import { optionalAuth } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import inquiryRoutes from './routes/inquiries.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const ADMIN_DIR = path.resolve(__dirname, 'admin');

export function createApp() {
  const app = express();

  app.set('trust proxy', CONFIG.TRUST_PROXY ? 1 : 0);
  app.disable('x-powered-by');

  // Existing pages use inline styles + PayPal SDK — tighten CSP later, not now.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.use(express.json({ limit: '1mb' }));

  const PgSessionStore = connectPgSimple(session);
  app.use(session({
    store: new PgSessionStore({ pool, tableName: 'session', createTableIfMissing: false }),
    secret: CONFIG.SESSION_SECRET,
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: CONFIG.COOKIE_SECURE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }));

  app.use(optionalAuth);

  // ---- API ----
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/inquiries', inquiryRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/config', (req, res) => {
    res.json({ paypalClientId: CONFIG.PAYPAL_CLIENT_ID || null, currency: 'USD' });
  });

  // ---- Admin panel (static shell; data endpoints are role-protected) ----
  // Explicit routes first, otherwise express.static redirects /admin → /admin/
  // and (no index.html) falls through to the storefront SPA fallback.
  app.get(['/admin', '/admin/'], (req, res) => res.sendFile(path.join(ADMIN_DIR, 'admin.html')));
  app.use('/admin', express.static(ADMIN_DIR));

  // ---- Frontend (built Vite output) ----
  app.use(express.static(DIST_DIR));

  // SPA fallback — index.html / shop.html are served directly by static; this
  // catches anything else (deep links) without swallowing /api 404s.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path === '/api') return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'), (err) => err && next());
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
