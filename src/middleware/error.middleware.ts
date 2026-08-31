import { logger } from '../utils/logger.js';
import { Request, Response, NextFunction } from 'express';
import { APIErrorResponse } from '../types/sep.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const timestamp = new Date().toISOString();

  if (err instanceof AppError) {
    const errorBody: APIErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        timestamp
      }
    };
    res.status(err.statusCode).json(errorBody);
    return;
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    const errorBody: APIErrorResponse = {
      error: {
        code: 'FILE_UPLOAD_ERROR',
        message: err.message,
        timestamp
      }
    };
    res.status(400).json(errorBody);
    return;
  }

  // Fallback for unhandled unexpected errors
  logger.error('[Unhandled Internal Error]:', err);
  const fallbackBody: APIErrorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
      timestamp
    }
  };
  res.status(500).json(fallbackBody);
}
