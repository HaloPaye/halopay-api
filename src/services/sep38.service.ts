export interface RFQQuoteRequest {
  sellAsset: string;
  buyAsset: string;
  sellAmount?: string;
  buyAmount?: string;
}

export interface RFQQuoteResponse {
  id: string;
  price: string;
  expiresAt: string;
  totalPrice: string;
  sellAsset: string;
  buyAsset: string;
}

export class SEP38QuoteService {
  public static calculateQuote(req: RFQQuoteRequest): RFQQuoteResponse {
    const baseRate = 0.125;
    const amount = parseFloat(req.sellAmount || '10');
    const total = (amount * baseRate).toFixed(4);
    const expires = new Date(Date.now() + 60000).toISOString();

    return {
      id: 'quote_' + Math.random().toString(36).substring(2, 9),
      price: baseRate.toString(),
      totalPrice: total,
      expiresAt: expires,
      sellAsset: req.sellAsset,
      buyAsset: req.buyAsset,
    };
  }
}