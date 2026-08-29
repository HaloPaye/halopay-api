import { AppError } from '../middleware/error.middleware.js';
import { SEP24QuoteRequest, SEP24QuoteResponse, SEP24WithdrawalRequest, SEP24InteractiveResponse } from '../types/sep.js';

export class SEP24SettlementService {
  private readonly anchorUrl: string;
  private readonly idempotencyCache: Map<string, SEP24InteractiveResponse>;

  constructor(anchorUrl = process.env.ANCHOR_URL || 'https://anchor.moneygram.com') {
    this.anchorUrl = anchorUrl;
    this.idempotencyCache = new Map();
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

  public async initiateWithdrawal(token: string, request: SEP24WithdrawalRequest, idempotencyKey?: string): Promise<SEP24InteractiveResponse> {
    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token required for SEP-24 withdrawal');
    }

    if (idempotencyKey && this.idempotencyCache.has(idempotencyKey)) {
      console.log(`[SEP-24] Returning cached response for idempotency key: ${idempotencyKey}`);
      return this.idempotencyCache.get(idempotencyKey)!;
    }

    if (!request.account || !request.amount || !request.asset_code) {
      throw new AppError(400, 'MISSING_WITHDRAWAL_PARAMS', 'Account, asset_code and amount are required fields');
    }

    const transactionId = `tx_sep24_${Date.now()}`;
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
    const callbackUrl = encodeURIComponent(`${baseUrl}/api/v1/settlement/webhook/sep24`);
    
    // Compliant SEP-24 Interactive URL formatting for MoneyGram
    const interactiveUrl = `${this.anchorUrl}/sep24/transactions/withdraw/interactive?transaction_id=${transactionId}&asset_code=${request.asset_code}&account=${request.account}&amount=${request.amount}&callback=${callbackUrl}`;

    console.log(`[SEP-24] Initiated interactive withdrawal. TxID: ${transactionId}`);

    const response: SEP24InteractiveResponse = {
      type: 'interactive_customer_info_needed',
      url: interactiveUrl,
      id: transactionId
    };

    if (idempotencyKey) {
      this.idempotencyCache.set(idempotencyKey, response);
    }

    return response;
  }

  public async processWebhook(payload: any): Promise<{ status: string }> {
    if (!payload || !payload.transaction || !payload.transaction.id) {
      throw new AppError(400, 'INVALID_WEBHOOK_PAYLOAD', 'Transaction ID is required in webhook payload');
    }

    const txId = payload.transaction.id;
    const status = payload.transaction.status;

    console.log(`[SEP-24 Webhook] Received status update for TxID ${txId}: ${status}`);

    // Here we would normally update the database and notify the frontend via WebSockets
    return { status: 'acknowledged' };
  }
}
