import crypto from 'crypto';

export class TokenRotationService {
  private static revokedTokens = new Set<string>();

  public static generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  public static revokeToken(token: string): void {
    this.revokedTokens.add(token);
  }

  public static isRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }
}