import { SEP24SettlementService } from '../src/services/sep24.service';
import { AppError } from '../src/middleware/error.middleware';
import { SEP24QuoteRequest, SEP24WithdrawalRequest } from '../src/types/sep';

describe('SEP-24 Settlement Service', () => {
  let sep24Service: SEP24SettlementService;

  beforeEach(() => {
    sep24Service = new SEP24SettlementService();
  });

  it('should calculate fees and quote expiration', async () => {
    const req: SEP24QuoteRequest = {
      sell_asset: 'USDC',
      buy_asset: 'USD',
      sell_amount: '100',
      account: 'GAKL9012345678901234567890123456789012345678901234567890'
    };

    const result = await sep24Service.getOffRampQuote('valid-token', req);
    expect(result.quote.fee.total).toBe('1.00');
    expect(result.quote.buy_amount).toBe('99.00');
    expect(result.quote.expires_at).toBeDefined();
  });

  it('should generate interactive withdrawal URL', async () => {
    const req: SEP24WithdrawalRequest = {
      asset_code: 'USDC',
      account: 'GAKL9012345678901234567890123456789012345678901234567890',
      amount: '99.00'
    };

    const result = await sep24Service.initiateWithdrawal('valid-token', req);
    expect(result.type).toBe('interactive_customer_info_needed');
    expect(result.url).toContain('amount=99.00');
    expect(result.url).toContain('account=GAKL');
  });

  it('should throw unauthorized without token', async () => {
    const req = {} as SEP24QuoteRequest;
    await expect(sep24Service.getOffRampQuote('', req)).rejects.toThrow(AppError);
  });
});
