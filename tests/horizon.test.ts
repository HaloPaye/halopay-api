import { PaymentWebSocketBroadcaster } from '../src/services/websocket.service';
import { HorizonListenerService } from '../src/services/horizon.service';

describe('Horizon Payment Listener & WebSocket Broadcaster', () => {
  let broadcaster: PaymentWebSocketBroadcaster;
  let listener: HorizonListenerService;

  beforeEach(() => {
    broadcaster = new PaymentWebSocketBroadcaster();
    listener = new HorizonListenerService(broadcaster);
  });

  it('should process Horizon payment record and format event payload', () => {
    const rawRecord = {
      id: '123456789',
      type: 'payment',
      from: 'GAID_RECIPIENT_ADDRESS',
      to: 'GAMERCHANT_ADDRESS',
      asset_type: 'credit_alphanum4',
      asset_code: 'USDC',
      asset_issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3Z75BVZTXFH4WCT4',
      amount: '25.0000000',
      created_at: '2026-08-04T12:00:00Z',
      transaction_hash: 'txhash1234567890abcdef',
      memo: 'AID_PAYMENT_001'
    };

    const event = listener.processPaymentRecord(rawRecord);
    expect(event).toBeDefined();
    expect(event.id).toBe('123456789');
    expect(event.amount).toBe('25.0000000');
    expect(event.asset_code).toBe('USDC');
  });

  it('should toggle Horizon stream listener status correctly', () => {
    expect(listener.getStatus()).toBe(false);
    listener.startListening('GAMERCHANT_PUBKEY');
    expect(listener.getStatus()).toBe(true);
    listener.stopListening();
    expect(listener.getStatus()).toBe(false);
  });
});
