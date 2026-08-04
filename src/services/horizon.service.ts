import { HorizonPaymentEvent } from '../types/sep.js';
import { PaymentWebSocketBroadcaster } from './websocket.service.js';

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

  public processPaymentRecord(record: {
    id: string;
    type: string;
    from: string;
    to: string;
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
    amount: string;
    created_at: string;
    transaction_hash: string;
    memo?: string;
  }): HorizonPaymentEvent {
    const paymentEvent: HorizonPaymentEvent = {
      id: record.id,
      type: record.type || 'payment',
      from: record.from,
      to: record.to,
      asset_type: record.asset_type,
      asset_code: record.asset_code || 'USDC',
      asset_issuer: record.asset_issuer,
      amount: record.amount,
      created_at: record.created_at || new Date().toISOString(),
      transaction_hash: record.transaction_hash,
      memo: record.memo
    };

    // Broadcast event to connected merchant POS devices
    this.broadcaster.broadcastPayment(paymentEvent);

    return paymentEvent;
  }

  public stopListening(): void {
    this.isListening = false;
    console.log('[Horizon Listener] Payment stream stopped.');
  }

  public getStatus(): boolean {
    return this.isListening;
  }
}
