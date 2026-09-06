import { Request, Response, NextFunction } from 'express';

export interface CspOptions {
  reportOnly?: boolean;
  allowedOrigins?: string[];
}

export function createCspMiddleware(options: CspOptions = {}) {
  const defaultSources = ["'self'", ...(options.allowedOrigins || [])].join(' ');
  const policy = [
    "default-src 'none'",
    `script-src ${defaultSources}`,
    `connect-src ${defaultSources} https://horizon.stellar.org https://horizon-testnet.stellar.org`,
    `img-src ${defaultSources} data:`,
    "style-src 'self' 'unsafe-inline'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  return (_req: Request, res: Response, next: NextFunction): void => {
    const headerName = options.reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';
    res.setHeader(headerName, policy);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  };
}
