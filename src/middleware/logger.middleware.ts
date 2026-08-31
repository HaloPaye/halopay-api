import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { asyncLocalStorage, logger } from '../utils/logger.js';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  res.setHeader('x-correlation-id', correlationId as string);

  const store = new Map<string, any>();
  store.set('correlationId', correlationId);

  asyncLocalStorage.run(store, () => {
    logger.info(`Incoming Request: ${req.method} ${req.url}`);
    
    // intercept response finish to log response status if needed
    res.on('finish', () => {
      logger.info(`Response: ${req.method} ${req.url} - ${res.statusCode}`);
    });

    next();
  });
};
