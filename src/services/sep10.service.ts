import { Keypair, Networks, WebAuth } from '@stellar/stellar-sdk';
import { AuthUtil } from '../utils/AuthUtil.js';
import { AppError } from '../middleware/error.middleware.js';
import { SEP10ChallengeResponse, SEP10TokenResponse } from '../types/sep.js';

export class SEP10AuthService {
  private readonly serverKeypair: Keypair;
  private readonly networkPassphrase: string;
  private readonly anchorDomain: string;

  constructor(
    serverSecretKey?: string,
    networkPassphrase = Networks.TESTNET,
    anchorDomain = process.env.ANCHOR_DOMAIN || 'anchor.moneygram.com'
  ) {
    if (serverSecretKey) {
      this.serverKeypair = Keypair.fromSecret(serverSecretKey);
    } else {
      // Fallback server keypair for development testing
      this.serverKeypair = Keypair.random();
    }
    this.networkPassphrase = networkPassphrase;
    this.anchorDomain = anchorDomain;
  }

  public generateChallenge(account: string, homeDomain?: string): SEP10ChallengeResponse {
    if (!account) {
      throw new AppError(400, 'INVALID_ACCOUNT', 'Stellar account public key is required');
    }

    try {
      const challengeTx = WebAuth.buildChallengeTx(
        this.serverKeypair,
        account,
        homeDomain || this.anchorDomain,
        300, // 5 minutes validity
        this.networkPassphrase,
        this.anchorDomain
      );

      return {
        transaction: challengeTx,
        network_passphrase: this.networkPassphrase
      };
    } catch (err: unknown) {
      console.error('buildChallengeTx error:', err);
      throw new AppError(400, 'CHALLENGE_BUILD_FAILED', 'Failed to generate SEP-10 challenge transaction', err);
    }
  }

  public verifyChallengeAndIssueToken(transactionXdr: string): SEP10TokenResponse {
    if (!transactionXdr) {
      throw new AppError(400, 'MISSING_TRANSACTION', 'Signed challenge transaction XDR is required');
    }

    try {
      const readResult = WebAuth.readChallengeTx(
        transactionXdr,
        this.serverKeypair.publicKey(),
        this.networkPassphrase,
        this.anchorDomain,
        this.anchorDomain
      );

      const signers = WebAuth.verifyChallengeTxSigners(
        transactionXdr,
        this.serverKeypair.publicKey(),
        this.networkPassphrase,
        [readResult.clientAccountID],
        this.anchorDomain,
        this.anchorDomain
      );

      if (!signers || signers.length === 0) {
        throw new AppError(401, 'INVALID_SIGNATURE', 'Challenge transaction lacks valid account signature');
      }

      const clientAccount = signers[0];
      const token = AuthUtil.generateSep10Token(clientAccount, this.anchorDomain);

      return { token };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw new AppError(401, 'AUTH_VERIFICATION_FAILED', 'Failed to verify signed challenge transaction', err);
    }
  }
}
