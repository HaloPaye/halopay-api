import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
  PORT: z.coerce.number().int().positive('PORT must be a positive integer').default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').default('postgres://localhost:5432/halopay'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required').default('redis://127.0.0.1:6379'),
  MERCHANT_PUBLIC_KEY: z.string().min(1, 'MERCHANT_PUBLIC_KEY is required').default('GA7Q33B656F42D5G77XJSB62G4U74N5G3277Y88U337G3H2I2K3L4M5N'),
  ANCHOR_DOMAIN: z.string().min(1, 'ANCHOR_DOMAIN is required').default('anchor.moneygram.com'),
  ANCHOR_URL: z.string().min(1, 'ANCHOR_URL is required').default('https://anchor.moneygram.com'),
  API_BASE_URL: z.string().min(1, 'API_BASE_URL is required').default('http://localhost:4000'),
  KYC_WEBHOOK_SECRET: z.string().min(1, 'KYC_WEBHOOK_SECRET is required').default('default_secret'),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  STELLAR_NETWORK_PASSPHRASE: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(
  env: Record<string, any> = process.env,
  exitOnError: boolean = process.env.NODE_ENV !== 'test'
): EnvConfig {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `  - ${err.path.join('.') || 'env'}: ${err.message}`)
      .join('\n');

    const errorMessage = `[Config Error] Invalid environment configuration:\n${errorDetails}`;

    try {
      logger.error(errorMessage);
    } catch {
      console.error(errorMessage);
    }

    if (exitOnError) {
      process.exit(1);
    }
    throw new Error(errorMessage);
  }

  return result.data;
}

export const config: EnvConfig = validateEnv(process.env);
