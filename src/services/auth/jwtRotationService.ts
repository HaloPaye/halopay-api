export interface KeyPairConfig {
  keyId: string;
  publicKey: string;
  isPrimary: boolean;
  createdAtMs: number;
}

export class JwtRotationService {
  private keys: Map<string, KeyPairConfig>;
  private primaryKeyId: string | null;

  constructor() {
    this.keys = new Map();
    this.primaryKeyId = null;
  }

  public registerKey(keyId: string, publicKey: string, isPrimary: boolean = false): void {
    const entry: KeyPairConfig = {
      keyId,
      publicKey,
      isPrimary,
      createdAtMs: Date.now(),
    };
    if (isPrimary) {
      this.keys.forEach((v) => (v.isPrimary = false));
      this.primaryKeyId = keyId;
    }
    this.keys.set(keyId, entry);
  }

  public getSigningKeyId(): string {
    if (!this.primaryKeyId || !this.keys.has(this.primaryKeyId)) {
      throw new Error('No primary signing key configured');
    }
    return this.primaryKeyId;
  }

  public getVerificationKey(keyId: string): string | null {
    return this.keys.get(keyId)?.publicKey || null;
  }

  public totalKeys(): number {
    return this.keys.size;
  }
}
