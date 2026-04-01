import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

const globalForDb = globalThis;

export const pool = globalForDb.__bookingsPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
});

if (!globalForDb.__bookingsPool) {
  globalForDb.__bookingsPool = pool;
  attachDatabasePool(pool);
}

export async function query(text, params = []) {
  return pool.query(text, params);
}
