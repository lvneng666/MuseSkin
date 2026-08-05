import pg from 'pg';
import { CONFIG } from '../config/env.js';

export const pool = new pg.Pool({
  connectionString: CONFIG.DATABASE_URL,
});
