import { pool } from '../config/db.js';

export async function pingDatabase() {
  await pool.query('SELECT 1');
}
