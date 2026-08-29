import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

export const tracingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || crypto.randomUUID();
  res.setHeader('x-correlation-id', req.headers['x-correlation-id'] as string);
  next();
};
