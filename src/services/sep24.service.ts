import { AppError } from '../middleware/error.middleware.js';
import { SEP24QuoteRequest, SEP24QuoteResponse, SEP24WithdrawalRequest, SEP24InteractiveResponse } from '../types/sep.js';

export class SEP24SettlementService {
  private readonly anchorUrl: string;

  constructor(anchorUrl = process.env.ANCHOR_URL || 'https://anchor.moneygram.com') {
    this.anchorUrl = anchorUrl;
  }

  public async getOffRampQuote(token: string, request: SEP24QuoteRequest): Promise<SEP24QuoteResponse> {
    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token required for SEP-24 quote');
    }

    const sellAmount = parseFloat(request.sell_amount);
    if (isNaN(sellAmount) || sellAmount <= 0) {
      throw new AppError(400, 'INVALID_AMOUNT', 'Sell amount must be a positive numeric value');
    }

    // Standard 1% off-ramp fee calculation
    const feeAmount = (sellAmount * 0.01).toFixed(2);
    const buyAmount = (sellAmount - parseFloat(feeAmount)).toFixed(2);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return {
      quote: {
        id: `quote_${Date.now()}`,
        price: '1.00',
        expires_at: expiresAt,
        sell_asset: request.sell_asset || 'USDC',
        sell_amount: request.sell_amount,
        buy_asset: request.buy_asset || 'USD',
        buy_amount: buyAmount,
        fee: {
          total: feeAmount,
          asset: request.sell_asset || 'USDC'
        }
      }
    };
  }

  public async initiateWithdrawal(token: string, request: SEP24WithdrawalRequest): Promise<SEP24InteractiveResponse> {
    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token required for SEP-24 withdrawal');
    }

    if (!request.account || !request.amount) {
      throw new AppError(400, 'MISSING_WITHDRAWAL_PARAMS', 'Account and amount are required fields');
    }

    const transactionId = `tx_sep24_${Date.now()}`;
    const interactiveUrl = `${this.anchorUrl}/sep24/interactive/withdraw?transaction_id=${transactionId}&account=${request.account}&amount=${request.amount}`;

    return {
      type: 'interactive_customer_info_needed',
      url: interactiveUrl,
      id: transactionId
    };
  }
}
