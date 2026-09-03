import { Request, Response, NextFunction } from 'express';

const inMemoryHits = new Map<string, { count: number; resetAt: number }>();

export function rateLimitMiddleware(limit: number = 60, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const entry = inMemoryHits.get(ip);

    if (!entry || now > entry.resetAt) {
      inMemoryHits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please retry shortly.',
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
      return;
    }

    entry.count += 1;
    next();
  };
}