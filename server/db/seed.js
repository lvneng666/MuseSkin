import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { pool } from './pool.js';
import { PRODUCTS } from './seed-data.js';
import { CONFIG } from '../config/env.js';

/** Idempotent upsert of the 12 catalog products. */
async function seedProducts() {
  for (const product of PRODUCTS) {
    const columns = Object.keys(product);
    const values = columns.map((c) => product[c]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const updates = columns.map((c) => `${c} = EXCLUDED.${c}`).join(', ');
    await pool.query(
      `INSERT INTO products (${columns.join(', ')})
       VALUES (${placeholders})
       ON CONFLICT (slug) DO UPDATE SET ${updates}`,
      values
    );
  }
  // eslint-disable-next-line no-console
  console.log(`Seeded ${PRODUCTS.length} products`);
}

/** Create the admin user from env if it doesn't exist. */
async function seedAdmin() {
  if (!CONFIG.ADMIN_EMAIL || !CONFIG.ADMIN_PASSWORD) {
    // eslint-disable-next-line no-console
    console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed');
    return;
  }
  const email = CONFIG.ADMIN_EMAIL.trim().toLowerCase();
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (rows.length === 0) {
    const password_hash = await bcrypt.hash(CONFIG.ADMIN_PASSWORD, 12);
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'admin')`,
      [email, password_hash, CONFIG.ADMIN_NAME]
    );
    // eslint-disable-next-line no-console
    console.log(`Seeded admin ${email}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Admin ${email} already exists`);
  }
}

export async function seed() {
  await seedProducts();
  await seedAdmin();
}

if (process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  seed()
    .then(() => pool.end())
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}
