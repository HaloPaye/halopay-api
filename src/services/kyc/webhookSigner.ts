import * as crypto from 'crypto';

export class KycWebhookSigner {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  public signPayload(payload: string, timestamp: number): string {
    const data = `${timestamp}.${payload}`;
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
  }

  public verifySignature(payload: string, timestamp: number, signature: string): boolean {
    const expected = this.signPayload(payload, timestamp);
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  }
}