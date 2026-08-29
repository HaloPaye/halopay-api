import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { SEP12KYCService, MultipartFile } from '../services/sep12.service.js';
import { SEP12CustomerPayload } from '../types/sep.js';
import { validate } from '../middleware/validate.middleware.js';
import { z } from 'zod';

const putCustomerSchema = z.object({
  body: z.object({
    account: z.string().min(1, 'Account is required'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email_address: z.string().email('Invalid email address'),
    phone_number: z.string().min(1, 'Phone number is required'),
    id_type: z.string().optional(),
    id_country_code: z.string().optional(),
    id_number: z.string().min(1, 'ID number is required'),
  })
});

const getCustomerSchema = z.object({
  query: z.object({
    account: z.string().min(1, 'Account is required'),
  })
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file limit
  }
});

export function createKYCRouter(kycService: SEP12KYCService): Router {
  const router = Router();

  /**
   * PUT /api/v1/kyc/customer
   * Ingests merchant KYC details and binary government ID photos (multipart/form-data).
   */
  router.put(
    '/customer',
    upload.fields([
      { name: 'id_photo_front', maxCount: 1 },
      { name: 'id_photo_back', maxCount: 1 },
      { name: 'photo_proof_residence', maxCount: 1 }
    ]),
    validate(putCustomerSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';

        const payload: SEP12CustomerPayload = {
          account: req.body.account,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email_address: req.body.email_address,
          phone_number: req.body.phone_number,
          id_type: req.body.id_type || 'id_card',
          id_country_code: req.body.id_country_code || 'HTI',
          id_number: req.body.id_number
        };

        const files = req.files as Record<string, MultipartFile[]>;
        const response = await kycService.submitCustomerKYC(token, payload, files);

        res.status(202).json(response);
      } catch (err) {
        next(err);
      }
    }
  );

  /**
   * GET /api/v1/kyc/customer
   * Queries merchant KYC status from the anchor.
   */
  router.get('/customer', validate(getCustomerSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
      const account = req.query.account as string;

      const status = await kycService.getCustomerStatus(token, account);
      res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/v1/kyc/webhook
   * Async webhook callback for SEP-12 identity verification providers.
   */
  router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['x-kyc-signature'] as string;
      const rawBody = JSON.stringify(req.body); // In a real app we'd use raw-body parser middleware, assuming express.json() for now

      if (!kycService.verifyWebhookHMAC(rawBody, signature)) {
        res.status(401).json({ error: 'Invalid HMAC signature' });
        return;
      }

      const { customer_id, status, reason } = req.body;
      if (!customer_id || !status) {
        res.status(400).json({ error: 'Missing customer_id or status' });
        return;
      }

      console.log(`[KYC Webhook] Customer ${customer_id} transitioned to status: ${status}. Reason: ${reason || 'none'}`);
      
      // Update database state machine logic goes here
      // db.updateCustomerKYC(customer_id, status, reason);

      res.status(200).json({ received: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
