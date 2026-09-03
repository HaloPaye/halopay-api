export interface FormattedStellarError {
  code: string;
  message: string;
  statusCode: number;
}

export function translateStellarErrorCode(horizonCode: string): FormattedStellarError {
  switch (horizonCode) {
    case 'op_underfunded':
    case 'tx_insufficient_balance':
      return { code: 'INSUFFICIENT_FUNDS', message: 'Account has insufficient funds for this transaction', statusCode: 400 };
    case 'op_bad_auth':
    case 'tx_bad_auth':
      return { code: 'BAD_AUTHORIZATION', message: 'Transaction signature verification failed', statusCode: 401 };
    case 'op_no_trust':
      return { code: 'NO_TRUSTLINE', message: 'Destination account lacks trustline for asset', statusCode: 400 };
    default:
      return { code: 'STELLAR_TRANSACTION_FAILED', message: 'Stellar transaction submission rejected by network', statusCode: 502 };
  }
}