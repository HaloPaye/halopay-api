// Stellar SDK Client Wrapper with Horizon Fallback
export const STELLAR_NETWORK_CONFIG = {
  horizonUrl: process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org',
  networkPassphrase: process.env.STELLAR_NETWORK || 'Test SDF Network ; September 2015',
  clientVersion: '@stellar/stellar-sdk@13.1.0',
};
