import { SEP10AuthService } from '../src/services/sep10.service';
import { Keypair } from '@stellar/stellar-sdk';
import { AppError } from '../src/middleware/error.middleware';

describe('SEP-10 Auth Service', () => {
  let authService: SEP10AuthService;
  const clientKeypair = Keypair.random();

  beforeEach(() => {
    authService = new SEP10AuthService();
  });

  it('should build challenge transaction', () => {
    const challenge = authService.generateChallenge(clientKeypair.publicKey());
    expect(challenge.transaction).toBeDefined();
    expect(challenge.network_passphrase).toBeDefined();
  });

  it('should throw error for missing account', () => {
    expect(() => authService.generateChallenge('')).toThrow(AppError);
  });

  it('should throw error on invalid verify', () => {
    expect(() => authService.verifyChallengeAndIssueToken('invalid-xdr')).toThrow(AppError);
  });
});
