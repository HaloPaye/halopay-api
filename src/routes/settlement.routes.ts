import { Router, Request, Response, NextFunction } from 'express';
import { SEP24SettlementService } from '../services/sep24.service.js';
import { validate } from '../middleware/validate.middleware.js';
import { z } from 'zod';

const quoteSchema = z.object({
  body: z.object({
    sell_asset: z.string().min(1, 'sell_asset is required'),
    buy_asset: z.string().min(1, 'buy_asset is required'),
    sell_amount: z.string().min(1, 'sell_amount is required'),
    account: z.string().min(1, 'account is required'),
  })
});

const withdrawSchema = z.object({
  body: z.object({
    asset_code: z.string().min(1, 'asset_code is required'),
    account: z.string().min(1, 'account is required'),
    amount: z.string().min(1, 'amount is required'),
    dest: z.string().optional(),
    dest_extra: z.string().optional(),
  })
});

export function createSettlementRouter(settlementService: SEP24SettlementService): Router {
  const router = Router();

  /**
   * POST /api/v1/settlement/quote
   * Fetches an off-ramp conversion quote for aggregated merchant USDC balance.
   */
  router.post('/quote', validate(quoteSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';

      const quote = await settlementService.getOffRampQuote(token, req.body);
      res.status(200).json(quote);
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/v1/settlement/withdraw
   * Initiates end-of-day programmatic SEP-24 USDC off-ramp withdrawal.
   */
  router.post('/withdraw', validate(withdrawSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
      const idempotencyKey = req.headers['idempotency-key'] as string;

      const result = await settlementService.initiateWithdrawal(token, req.body, idempotencyKey);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/v1/settlement/webhook/sep24
   * Receives asynchronous status updates from the anchor regarding SEP-24 transactions.
   */
  router.post('/webhook/sep24', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await settlementService.processWebhook(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
