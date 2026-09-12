import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export interface AuditRecord {
  id: string;
  method: string;
  path: string;
  timestamp: string;
  ip: string;
  payloadDigest: string;
}

const auditLog: AuditRecord[] = [];

export function auditLogMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const payloadStr = JSON.stringify(req.body || {});
  const digest = crypto.createHash('sha256').update(payloadStr).digest('hex');

  const record: AuditRecord = {
    id: 'aud_' + crypto.randomBytes(6).toString('hex'),
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
    payloadDigest: digest,
  };

  auditLog.push(record);
  if (auditLog.length > 500) auditLog.shift();
  next();
}

export function getAuditLogs(): AuditRecord[] {
  return [...auditLog];
}
