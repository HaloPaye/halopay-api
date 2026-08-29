import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const tracingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.headers['x-correlation-id']);
  next();
};
