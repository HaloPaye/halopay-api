import { logger } from './logger.js';
import { Pool } from 'pg';
import { config } from '../config/index.js';

export const dbPool = new Pool({
  max: 50,
  idleTimeoutMillis: 30000,
  connectionString: config.DATABASE_URL
});

export const initDatabase = async () => {
  const client = await dbPool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        status VARCHAR(50) NOT NULL,
        amount DECIMAL(18,7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_status_created_at 
      ON transactions (status, created_at);
    `);
    logger.info('[DB] Initialized transactions table and composite indexes.');
  } finally {
    client.release();
  }
};
