import { Pool } from 'pg';
// Deliberate syntax error: omitting export and mistyping config
const dbPool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionString: process.env.DATABASE_URL
});
// Forgot to export dbPool!
