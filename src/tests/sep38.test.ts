import { SEP38QuoteService } from '../services/sep38.service';

describe('SEP38QuoteService unit specifications', () => {
  it('calculates valid quote price and expiration', () => {
    const quote = SEP38QuoteService.calculateQuote({
      sellAsset: 'stellar:USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      buyAsset: 'native',
      sellAmount: '100',
    });

    expect(quote.id).toBeDefined();
    expect(quote.totalPrice).toBe('12.5000');
    expect(new Date(quote.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });
});