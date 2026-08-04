import { SEP12KYCService, MultipartFile } from '../src/services/sep12.service';
import { SEP12CustomerPayload } from '../src/types/sep';
import { AppError } from '../src/middleware/error.middleware';

describe('SEP-12 KYC Ingestion & Binary Photo Handling', () => {
  let kycService: SEP12KYCService;

  beforeEach(() => {
    kycService = new SEP12KYCService('https://anchor.moneygram.com');
  });

  it('should accept valid merchant KYC payload and binary ID image files', async () => {
    const payload: SEP12CustomerPayload = {
      account: 'GAKL9012345678901234567890123456789012345678901234567890',
      first_name: 'Jean',
      last_name: 'Pierre',
      email_address: 'jean@halopay.io',
      phone_number: '+50937000000',
      id_type: 'id_card',
      id_country_code: 'HTI',
      id_number: 'HTI-987654321'
    };

    const mockFile: MultipartFile = {
      fieldname: 'id_photo_front',
      originalname: 'national_id_front.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake-binary-jpeg-data'),
      size: 1024
    };

    const result = await kycService.submitCustomerKYC('valid-jwt-token', payload, [mockFile]);
    expect(result).toBeDefined();
    expect(result.id).toContain('kyc_');
    expect(result.status).toBe('PROCESSING');
  });

  it('should reject non-image file uploads with 400 AppError', async () => {
    const payload: SEP12CustomerPayload = {
      account: 'GAKL9012345678901234567890123456789012345678901234567890',
      first_name: 'Jean',
      last_name: 'Pierre',
      email_address: 'jean@halopay.io',
      phone_number: '+50937000000',
      id_type: 'id_card',
      id_country_code: 'HTI',
      id_number: 'HTI-987654321'
    };

    const invalidFile: MultipartFile = {
      fieldname: 'id_photo_front',
      originalname: 'document.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      buffer: Buffer.from('fake-pdf-data'),
      size: 500
    };

    await expect(kycService.submitCustomerKYC('valid-jwt-token', payload, [invalidFile]))
      .rejects
      .toThrow(AppError);
  });
});
