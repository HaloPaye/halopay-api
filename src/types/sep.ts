/**
 * HaloPay API SEP Standard Payload Type Definitions
 */

export interface SEP10ChallengeResponse {
  transaction: string;
  network_passphrase: string;
}

export interface SEP10TokenResponse {
  token: string;
}

export interface SEP12CustomerField {
  type: 'string' | 'binary' | 'number' | 'date';
  description: string;
  optional?: boolean;
}

export type SEP12KYCStatus = 'ACCEPTED' | 'PROCESSING' | 'NEEDS_INFO' | 'REJECTED';

export interface SEP12PutCustomerResponse {
  id: string;
  status?: SEP12KYCStatus;
}

export interface SEP12GetCustomerResponse {
  id: string;
  status: SEP12KYCStatus;
  fields?: Record<string, SEP12CustomerField>;
  provided_fields?: Record<string, { status: string; error?: string }>;
  message?: string;
}

export interface SEP12CustomerPayload {
  account: string;
  memo?: string;
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  id_type: 'passport' | 'id_card' | 'drivers_license';
  id_country_code: string;
  id_issue_date?: string;
  id_expiration_date?: string;
  id_number: string;
}

export interface SEP24QuoteRequest {
  sell_asset: string;
  buy_asset: string;
  sell_amount: string;
  account: string;
}

export interface SEP24QuoteResponse {
  quote: {
    id: string;
    price: string;
    expires_at: string;
    sell_asset: string;
    sell_amount: string;
    buy_asset: string;
    buy_amount: string;
    fee: {
      total: string;
      asset: string;
    };
  };
}

export interface SEP24WithdrawalRequest {
  asset_code: string;
  account: string;
  amount: string;
  dest?: string;
  dest_extra?: string;
}

export interface SEP24InteractiveResponse {
  type: 'interactive_customer_info_needed';
  url: string;
  id: string;
}

export interface HorizonPaymentEvent {
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
}

export interface APIErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}
