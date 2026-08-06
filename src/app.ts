import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { errorHandler } from './middleware/error.middleware.js';
import { SEP10AuthService } from './services/sep10.service.js';
import { SEP12KYCService } from './services/sep12.service.js';
import { SEP24SettlementService } from './services/sep24.service.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createKYCRouter } from './routes/kyc.routes.js';
import { createSettlementRouter } from './routes/settlement.routes.js';

export function createApp(): Express {
  const app = express();

  // Security Middleware
  app.use(helmet());
  app.use(cors());

  // Rate Limiting (100 requests per 15 minutes per IP)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests from this IP, please try again later.' } }
  });
  app.use('/api/', limiter);

  // Payload Limits & HTTP Parameter Pollution protection
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(hpp());

  // Instantiate services
  const authService = new SEP10AuthService();
  const kycService = new SEP12KYCService();
  const settlementService = new SEP24SettlementService();

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      service: 'halopay-api',
      version: '0.1.0',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API routers
  app.use('/api/v1/auth', createAuthRouter(authService));
  app.use('/api/v1/kyc', createKYCRouter(kycService));
  app.use('/api/v1/settlement', createSettlementRouter(settlementService));

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
