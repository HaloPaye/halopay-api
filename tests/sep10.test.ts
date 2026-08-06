import { SEP10AuthService } from '../src/services/sep10.service';
import { Keypair, TransactionBuilder, Networks, Transaction } from '@stellar/stellar-sdk';
import { AppError } from '../src/middleware/error.middleware';

describe('SEP-10 Auth Service', () => {
  let authService: SEP10AuthService;
  const clientKeypair = Keypair.random();
  const serverKeypair = Keypair.random(); // custom server key

  beforeEach(() => {
    authService = new SEP10AuthService(serverKeypair.secret());
  });

  it('should build challenge transaction', () => {
    const challenge = authService.generateChallenge(clientKeypair.publicKey());
    expect(challenge.transaction).toBeDefined();
    expect(challenge.network_passphrase).toBeDefined();
  });

  it('should throw error for missing account', () => {
    expect(() => authService.generateChallenge('')).toThrow(AppError);
  });

  it('should throw error for invalid account', () => {
    expect(() => authService.generateChallenge('INVALID_ACCOUNT_ID')).toThrow(AppError);
  });

  it('should throw error on missing transaction XDR', () => {
    expect(() => authService.verifyChallengeAndIssueToken('')).toThrow(AppError);
  });

  it('should throw error on invalid verify', () => {
    expect(() => authService.verifyChallengeAndIssueToken('invalid-xdr')).toThrow(AppError);
  });

  it('should verify valid signed challenge and return token', () => {
    const challenge = authService.generateChallenge(clientKeypair.publicKey());
    const tx = TransactionBuilder.fromXDR(challenge.transaction, Networks.TESTNET) as Transaction;
    tx.sign(clientKeypair);
    const signedXdr = tx.toXDR();
    
    const tokenResponse = authService.verifyChallengeAndIssueToken(signedXdr);
    expect(tokenResponse.token).toBeDefined();
  });
});
