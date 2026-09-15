import { Request, Response, NextFunction } from 'express';

export interface VersioningOptions {
  apiVersion?: string;
  enforceProtocol?: boolean;
}

export function createVersionHeaderMiddleware(options: VersioningOptions = {}) {
  const apiVersion = options.apiVersion || '2026.09-v1';

  return (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('X-HaloPay-API-Version', apiVersion);
    res.setHeader('X-Engine-Release', 'Soroban-Horizon-Bridge');
    next();
  };
}
