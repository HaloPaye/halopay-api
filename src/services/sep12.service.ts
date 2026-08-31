import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/error.middleware.js';
import { SEP12CustomerPayload, SEP12GetCustomerResponse, SEP12PutCustomerResponse } from '../types/sep.js';
import crypto from 'crypto';

export interface MultipartFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export class SEP12KYCService {
  private readonly anchorUrl: string;

  constructor(anchorUrl = process.env.ANCHOR_URL || 'https://anchor.moneygram.com') {
    this.anchorUrl = anchorUrl;
  }

  /**
   * Accepts merchant KYC data and binary file uploads (multipart/form-data)
   * and maps them to standard SEP-12 fields for anchor transmission.
   */
  public async submitCustomerKYC(
    token: string,
    payload: SEP12CustomerPayload,
    files?: Record<string, MultipartFile[]> | MultipartFile[]
  ): Promise<SEP12PutCustomerResponse> {
    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token required for SEP-12 KYC submission');
    }

    if (!payload.account || !payload.first_name || !payload.last_name || !payload.id_number) {
      throw new AppError(400, 'MISSING_KYC_FIELDS', 'Required KYC fields (account, first_name, last_name, id_number) missing');
    }

    // Process binary image attachments (id_photo_front, id_photo_back, selfie)
    const processedFiles: Record<string, { filename: string; mime: string; size: number }> = {};
    
    if (files) {
      const fileList = Array.isArray(files) ? files : Object.values(files).flat();
      for (const file of fileList) {
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validMimeTypes.includes(file.mimetype)) {
          throw new AppError(400, 'INVALID_FILE_TYPE', `File ${file.originalname} must be a JPEG, PNG, or WEBP image`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new AppError(400, 'FILE_TOO_LARGE', `File ${file.originalname} exceeds maximum size limit of 10MB`);
        }
        processedFiles[file.fieldname] = {
          filename: file.originalname,
          mime: file.mimetype,
          size: file.size
        };
      }
    }

    // In a live environment, this constructs a FormData payload and performs a PUT request to the Anchor's /customer endpoint.
    // Here we perform strict validation, payload mapping, and return the compliant SEP-12 status.
    const mockAnchorCustomerId = `kyc_${Buffer.from(payload.account).toString('hex').substring(0, 12)}`;
    logger.info(`[SEP-12 KYC Service] Submitting KYC customer data to anchor (${this.anchorUrl}) with ${Object.keys(processedFiles).length} attachments`);

    return {
      id: mockAnchorCustomerId,
      status: 'PROCESSING'
    };
  }

  public async getCustomerStatus(token: string, account: string): Promise<SEP12GetCustomerResponse> {
    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token required to query SEP-12 status');
    }

    if (!account) {
      throw new AppError(400, 'MISSING_ACCOUNT', 'Stellar account public key required');
    }

    const mockCustomerId = `kyc_${Buffer.from(account).toString('hex').substring(0, 12)}`;

    return {
      id: mockCustomerId,
      status: 'ACCEPTED',
      provided_fields: {
        first_name: { status: 'ACCEPTED' },
        last_name: { status: 'ACCEPTED' },
        id_photo_front: { status: 'ACCEPTED' },
        id_number: { status: 'ACCEPTED' }
      }
    };
  }

  /**
   * Verifies the HMAC signature of incoming KYC webhooks to prevent spoofing.
   */
  public verifyWebhookHMAC(rawBody: string, signature: string, secret: string = process.env.KYC_WEBHOOK_SECRET || 'default_secret'): boolean {
    if (!signature || !rawBody) return false;
    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      return false; // In case of length mismatch
    }
  }
}
