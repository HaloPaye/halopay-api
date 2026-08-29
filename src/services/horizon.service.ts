import { HorizonPaymentEvent } from '../types/sep.js';
import { PaymentWebSocketBroadcaster } from './websocket.service.js';

import { z } from 'zod';

const paymentSchema = z.object({
  id: z.string(),
  type: z.string().default('payment'),
  from: z.string(),
  to: z.string(),
  asset_type: z.string(),
  asset_code: z.string().optional().default('USDC'),
  asset_issuer: z.string().optional(),
  amount: z.string().min(1),
  created_at: z.string().optional(),
  transaction_hash: z.string(),
  memo: z.string().optional(),
});

export class HorizonListenerService {
  private isListening = false;
  private readonly broadcaster: PaymentWebSocketBroadcaster;

  constructor(broadcaster: PaymentWebSocketBroadcaster) {
    this.broadcaster = broadcaster;
  }

  public startListening(accountPublicKey: string): void {
    if (this.isListening) {
      return;
    }

    this.isListening = true;
    console.log(`[Horizon Listener] Streaming on-chain payments for account: ${accountPublicKey}`);
  }

  public processPaymentRecord(record: any): HorizonPaymentEvent | null {
    try {
      const parsedRecord = paymentSchema.parse(record);
      
      const paymentEvent: HorizonPaymentEvent = {
        id: parsedRecord.id,
        type: parsedRecord.type,
        from: parsedRecord.from,
        to: parsedRecord.to,
        asset_type: parsedRecord.asset_type,
        asset_code: parsedRecord.asset_code,
        asset_issuer: parsedRecord.asset_issuer,
        amount: parsedRecord.amount,
        created_at: parsedRecord.created_at || new Date().toISOString(),
        transaction_hash: parsedRecord.transaction_hash,
        memo: parsedRecord.memo
      };

      // Broadcast event to connected merchant POS devices
      this.broadcaster.broadcastPayment(paymentEvent);

      return paymentEvent;
    } catch (error) {
      console.error('[Horizon Listener] Dead-letter transaction: schema validation failed', error);
      return null;
    }
  }

  public stopListening(): void {
    this.isListening = false;
    console.log('[Horizon Listener] Payment stream stopped.');
  }

  public getStatus(): boolean {
    return this.isListening;
  }
}
