import { Pool } from 'pg';
export const dbPool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionString: process.env.DATABASE_URL
});
