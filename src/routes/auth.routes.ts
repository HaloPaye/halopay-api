import { Router, Request, Response, NextFunction } from 'express';
import { SEP10AuthService } from '../services/sep10.service.js';

export function createAuthRouter(authService: SEP10AuthService): Router {
  const router = Router();

  /**
   * GET /api/v1/auth/challenge
   * Initiates SEP-10 Web Authentication flow by generating a challenge transaction.
   */
  router.get('/challenge', (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = req.query.account as string;
      const homeDomain = req.query.home_domain as string | undefined;

      const challenge = authService.generateChallenge(account, homeDomain);
      res.status(200).json(challenge);
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/v1/auth/token
   * Verifies signed challenge transaction and issues JWT authentication token.
   */
  router.post('/token', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { transaction } = req.body;
      const result = authService.verifyChallengeAndIssueToken(transaction);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
