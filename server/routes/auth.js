import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { sendResetPasswordEmail } from '../services/email.js';

const router = Router();

const publicUser = (u) => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role });
const normalizeEmail = (email) => email.trim().toLowerCase();

const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Name is required').max(120),
});

router.post('/register', authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, role`,
      [normalizedEmail, password_hash, full_name.trim()]
    );

    req.session.user = publicUser(rows[0]);
    res.status(201).json({ user: publicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', authLimiter, validate(z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
})), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const { rows } = await pool.query(
      'SELECT id, email, full_name, role, password_hash FROM users WHERE email = $1',
      [normalizedEmail]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    req.session.user = publicUser(user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('sid');
    res.status(204).end();
  });
});

router.get('/me', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user: req.session.user });
});

router.post('/forgot-password', authLimiter, validate(z.object({
  email: z.string().email('Valid email required'),
})), async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (rows.length > 0) {
      const token = crypto.randomBytes(32).toString('hex');
      await pool.query(
        `UPDATE users
         SET reset_token = $1, reset_token_expires_at = now() + interval '1 hour'
         WHERE id = $2`,
        [token, rows[0].id]
      );
      await sendResetPasswordEmail(normalizedEmail, token);
    }
    // Always 200 to avoid leaking which emails are registered.
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', authLimiter, validate(z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires_at > now()',
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Reset token is invalid or has expired' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE id = $2',
      [password_hash, rows[0].id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
