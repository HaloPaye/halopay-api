import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { SEP12KYCService, MultipartFile } from '../services/sep12.service.js';
import { SEP12CustomerPayload } from '../types/sep.js';

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
  router.get('/customer', async (req: Request, res: Response, next: NextFunction) => {
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

  return router;
}
