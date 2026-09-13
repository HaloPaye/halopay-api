import { PoolMonitor } from '../utils/db/poolMonitor';
import { Sep10ClaimsVerifier } from '../services/sep10/claimsVerifier';
import { HorizonReconnectManager } from '../services/horizon/reconnectManager';
import { KycWebhookSigner } from '../services/kyc/webhookSigner';

describe('API Day 13 Core Services', () => {
  test('PoolMonitor calculates stats and health score', () => {
    const monitor = new PoolMonitor(10);
    monitor.updateCounts(5, 5, 0);
    const stats = monitor.getStats();
    expect(stats.totalCount).toBe(5);
    expect(stats.idleCount).toBe(5);
    expect(stats.isSaturated).toBe(false);
    expect(monitor.calculateHealthScore()).toBe(50);
  });

  test('Sep10ClaimsVerifier accepts valid token claims', () => {
    const verifier = new Sep10ClaimsVerifier('https://api.halopay.network');
    const now = 1700000000;
    const result = verifier.verify({
      sub: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7',
      iss: 'https://api.halopay.network',
      iat: now - 10,
      exp: now + 300,
    }, now);
    expect(result.valid).toBe(true);
  });

  test('HorizonReconnectManager backs off and resets', () => {
    const manager = new HorizonReconnectManager(500, 4000);
    const delay1 = manager.getNextDelay(0);
    const delay2 = manager.getNextDelay(0);
    expect(delay1).toBe(500);
    expect(delay2).toBe(1000);
    expect(manager.getAttempts()).toBe(2);
    manager.reset();
    expect(manager.getAttempts()).toBe(0);
  });

  test('KycWebhookSigner generates and verifies HMAC signatures', () => {
    const signer = new KycWebhookSigner('test-secret-salt-12345');
    const payload = '{"customer_id":"cust_99","status":"approved"}';
    const timestamp = 1700000000;
    const sig = signer.signPayload(payload, timestamp);
    expect(signer.verifySignature(payload, timestamp, sig)).toBe(true);
  });
});