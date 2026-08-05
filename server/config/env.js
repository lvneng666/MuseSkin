import 'dotenv/config';
import { z } from 'zod';

// "true"/"false"/"" env strings → booleans (z.coerce.boolean() treats "false" as true, so preprocess manually)
const envBool = (defaultValue) =>
  z.preprocess(
    (v) => (v === undefined || v === '' ? defaultValue : String(v).toLowerCase() === 'true'),
    z.boolean()
  );

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  BASE_URL: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 characters'),
  COOKIE_SECURE: envBool(false),
  TRUST_PROXY: envBool(false),

  // Admin seed
  ADMIN_EMAIL: z.string().email().optional().default(undefined),
  ADMIN_PASSWORD: z.string().min(8).optional().default(undefined),
  ADMIN_NAME: z.string().default('Peaffee Admin'),

  // SMTP email
  SMTP_HOST: z.string().optional().default(undefined),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_SECURE: envBool(false),
  SMTP_USER: z.string().optional().default(undefined),
  SMTP_PASS: z.string().optional().default(undefined),
  MAIL_FROM: z.string().default('Peaffee <concierge@peaffee.com>'),
  ADMIN_NOTIFY_EMAIL: z.string().optional().default(undefined),

  // PayPal
  PAYPAL_CLIENT_ID: z.string().optional().default(undefined),
  PAYPAL_CLIENT_SECRET: z.string().optional().default(undefined),
  PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
  PAYPAL_WEBHOOK_ID: z.string().optional().default(undefined),

  // Western Union
  WU_BENEFICIARY: z.string().optional().default(undefined),
  WU_BANK: z.string().optional().default(undefined),
  WU_ACCOUNT: z.string().optional().default(undefined),
  WU_SWIFT: z.string().optional().default(undefined),
  WU_CURRENCY: z.string().default('USD'),

  // Cloudflare R2 (formerly r2.config.json)
  R2_ENDPOINT: z.string().optional().default(undefined),
  R2_BUCKET: z.string().optional().default(undefined),
  R2_CUSTOM_DOMAIN: z.string().optional().default(undefined),
  R2_ACCESS_KEY_ID: z.string().optional().default(undefined),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(undefined),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const CONFIG = parsed.data;
