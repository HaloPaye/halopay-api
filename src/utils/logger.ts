import winston from 'winston';
import { AsyncLocalStorage } from 'async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

const redactFormat = winston.format((info) => {
  // Redact sensitive fields
  const sensitiveKeys = ['password', 'email', 'token', 'secret'];
  
  const redact = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key in obj) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        redact(obj[key]);
      }
    }
  };

  redact(info);
  return info;
});

const correlationIdFormat = winston.format((info) => {
  const store = asyncLocalStorage.getStore();
  if (store && store.has('correlationId')) {
    info['x-correlation-id'] = store.get('correlationId');
  }
  return info;
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    correlationIdFormat(),
    redactFormat(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ],
});
