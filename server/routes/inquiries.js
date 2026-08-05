import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { validate } from '../middleware/validate.js';
import { inquiryLimiter } from '../middleware/rateLimit.js';
import { sendInquiryNotificationEmail } from '../services/email.js';

const router = Router();

/** Public contact/care form → stored as an inquiry + emailed to the team. */
router.post('/', inquiryLimiter, validate(z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Valid email required'),
  interest: z.string().max(200).optional().default(''),
  message: z.string().min(1, 'Message is required').max(5000),
})), async (req, res, next) => {
  try {
    const { name, email, interest, message } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO inquiries (name, email, interest, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, interest, message, status, created_at`,
      [name.trim(), email.trim().toLowerCase(), interest || null, message.trim()]
    );
    sendInquiryNotificationEmail(rows[0]);
    res.status(201).json({ inquiry: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
