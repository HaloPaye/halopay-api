export interface TransactionRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
}

export interface UserRecord {
  id: string;
  email: string;
  is_verified: boolean;
  created_at: Date;
}

export interface SettlementRecord {
  id: string;
  transaction_id: string;
  settled_amount: number;
  settled_at: Date;
}
