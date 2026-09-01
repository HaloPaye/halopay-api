import { logger } from '../utils/logger.js';
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { AppError } from './error.middleware.js';
import { config } from '../config/index.js';

// Setup Redis Client
const redisClient = new Redis(config.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 0,
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

/**
 * Redis-backed sliding window rate limiter
 * 
 * @param windowMs Window duration in milliseconds
 * @param maxRequests Maximum allowed requests per window
 */
export function slidingWindowRateLimiter(windowMs: number, maxRequests: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `ratelimit:${req.originalUrl}:${ip}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      const multi = redisClient.multi();
      // Remove old requests outside the window
      multi.zremrangebyscore(key, 0, windowStart);
      // Add current request timestamp
      multi.zadd(key, now, `${now}-${Math.random()}`);
      // Count requests in the window
      multi.zcard(key);
      // Expire the key after the window duration to save memory
      multi.pexpire(key, windowMs);

      const results = await multi.exec();
      
      if (!results) {
        throw new Error('Redis transaction failed');
      }

      const requestCount = results[2][1] as number;

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requestCount));

      if (requestCount > maxRequests) {
        throw new AppError(429, 'TOO_MANY_REQUESTS', 'Rate limit exceeded. Please try again later.');
      }

      next();
    } catch (err) {
      if (err instanceof AppError) {
        return next(err);
      }
      logger.error('Rate limiter error, failing open', err);
      // Fail open if Redis is down
      next();
    }
  };
}
