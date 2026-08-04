import { Router, Request, Response, NextFunction } from 'express';
import { SEP24SettlementService } from '../services/sep24.service.js';

export function createSettlementRouter(settlementService: SEP24SettlementService): Router {
  const router = Router();

  /**
   * POST /api/v1/settlement/quote
   * Fetches an off-ramp conversion quote for aggregated merchant USDC balance.
   */
  router.post('/quote', async (req: Request, res: Response, next: NextFunction) => {
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
  router.post('/withdraw', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';

      const result = await settlementService.initiateWithdrawal(token, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
