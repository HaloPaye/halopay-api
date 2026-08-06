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

  // Root endpoint (API Splash Page)
  app.get('/', (_req: Request, res: Response) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HaloPay API Settlement Engine</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: #020617;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .container {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 3rem;
            border-radius: 1.5rem;
            text-align: center;
            max-width: 600px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          h1 {
            margin-top: 0;
            font-size: 2rem;
            background: linear-gradient(to right, #60a5fa, #34d399);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          p {
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 2rem;
          }
          .links {
            display: grid;
            gap: 1rem;
            grid-template-columns: 1fr 1fr;
          }
          a {
            display: inline-block;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #e2e8f0;
            text-decoration: none;
            padding: 1rem;
            border-radius: 0.75rem;
            transition: all 0.2s ease;
            font-weight: 600;
          }
          a:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: #3b82f6;
            transform: translateY(-2px);
          }
          .status {
            margin-top: 2rem;
            font-size: 0.875rem;
            color: #10b981;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          .dot {
            width: 8px;
            height: 8px;
            background-color: #10b981;
            border-radius: 50%;
            box-shadow: 0 0 10px #10b981;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>HaloPay API</h1>
          <p>The secure Settlement Engine bridging offline merchants with the Stellar ecosystem. Handles SEP-10 Authentication, SEP-12 KYC routing, and SEP-24 Fiat Off-Ramping.</p>
          <div class="links">
            <a href="/health">System Health</a>
            <a href="https://halopay-docs.vercel.app/" target="_blank">Documentation</a>
            <a href="https://pos.halopaye.com" target="_blank">Merchant POS</a>
            <a href="https://github.com/HaloPaye/halopay-api" target="_blank">GitHub Source</a>
          </div>
          <div class="status">
            <div class="dot"></div>
            Engine Online
          </div>
        </div>
      </body>
      </html>
    `);
  });

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
