import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { errorHandler } from './middleware/error.middleware.js';
import { loggerMiddleware } from './middleware/logger.middleware.js';
import { SEP10AuthService } from './services/sep10.service.js';
import { SEP12KYCService } from './services/sep12.service.js';
import { SEP24SettlementService } from './services/sep24.service.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createKYCRouter } from './routes/kyc.routes.js';
import { createSettlementRouter } from './routes/settlement.routes.js';

export function createApp(): Express {
  const app = express();

  // Logging and tracing
  app.use(loggerMiddleware);

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
        <title>HaloPay Settlement API</title>
        <style>
          body {
            margin: 0;
            padding: 2rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            background-color: #0f172a;
            color: #cbd5e1;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 2rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
          }
          h1 {
            color: #f8fafc;
            border-bottom: 1px solid #334155;
            padding-bottom: 1rem;
            margin-top: 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .badge {
            background-color: #10b981;
            color: #064e3b;
            font-size: 0.75rem;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          h2 {
            color: #e2e8f0;
            margin-top: 2.5rem;
            font-size: 1.25rem;
          }
          .endpoint {
            background: #0f172a;
            border: 1px solid #334155;
            border-left: 4px solid #3b82f6;
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 4px;
          }
          .endpoint.ws {
            border-left-color: #8b5cf6;
          }
          .method {
            font-weight: bold;
            color: #3b82f6;
            margin-right: 0.5rem;
          }
          .method.get { color: #10b981; }
          .method.post { color: #f59e0b; }
          .method.ws { color: #8b5cf6; }
          .path {
            color: #f8fafc;
            font-weight: 600;
          }
          .desc {
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: #94a3b8;
          }
          .footer-links {
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid #334155;
            display: flex;
            gap: 1.5rem;
            font-size: 0.9rem;
          }
          a {
            color: #38bdf8;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>HaloPay Settlement API <span class="badge">Online</span></h1>
          <p>This is the backend settlement engine for the HaloPay Protocol. It acts as the bridge between the offline-first Merchant POS and the Stellar network, handling authentication, KYC ingestion, and automated fiat off-ramping.</p>
          
          <h2>REST Endpoints</h2>
          
          <div class="endpoint">
            <div><span class="method get">GET</span> <span class="path">/health</span></div>
            <div class="desc">System health check and version verification.</div>
          </div>

          <div class="endpoint">
            <div><span class="method get">GET</span> <span class="path">/api/v1/auth/</span></div>
            <div class="desc">SEP-10 Stellar Authentication. Initiates the challenge/response flow for merchant wallets to authenticate securely with the backend.</div>
          </div>

          <div class="endpoint">
            <div><span class="method post">POST</span> <span class="path">/api/v1/kyc/customer</span></div>
            <div class="desc">SEP-12 KYC Ingestion. Accepts multipart/form-data for merchant government ID and photo uploads (up to 10MB limit), securely routing them to the MoneyGram anchor.</div>
          </div>

          <div class="endpoint">
            <div><span class="method post">POST</span> <span class="path">/api/v1/settlement/withdraw</span></div>
            <div class="desc">SEP-24 Fiat Off-Ramp Orchestration. Triggers the interactive withdrawal process to convert aggregated merchant USDC balances into local fiat.</div>
          </div>

          <h2>WebSocket Endpoints</h2>

          <div class="endpoint ws">
            <div><span class="method ws">WS</span> <span class="path">/ws/payments</span></div>
            <div class="desc">Persistent Horizon listener. Broadcasts incoming on-chain Stellar payments to connected POS terminals in real-time.</div>
          </div>

          <div class="footer-links">
            <a href="https://halopay-docs.vercel.app/" target="_blank">Documentation Site &rarr;</a>
            <a href="https://halopay-pos.vercel.app/" target="_blank">Launch POS Terminal &rarr;</a>
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
