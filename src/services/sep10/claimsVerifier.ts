export interface Sep10Claims {
  sub: string;
  iss: string;
  iat: number;
  exp: number;
  client_domain?: string;
}

export class Sep10ClaimsVerifier {
  private expectedIssuer: string;
  private allowedClockSkewSec: number;

  constructor(expectedIssuer: string, allowedClockSkewSec: number = 30) {
    this.expectedIssuer = expectedIssuer;
    this.allowedClockSkewSec = allowedClockSkewSec;
  }

  public verify(claims: Sep10Claims, nowSec: number = Math.floor(Date.now() / 1000)): { valid: boolean; error?: string } {
    if (claims.iss !== this.expectedIssuer) {
      return { valid: false, error: 'Invalid issuer' };
    }
    if (claims.iat > nowSec + this.allowedClockSkewSec) {
      return { valid: false, error: 'Token issued in future' };
    }
    if (claims.exp <= nowSec - this.allowedClockSkewSec) {
      return { valid: false, error: 'Token expired' };
    }
    if (!claims.sub || !claims.sub.startsWith('G')) {
      return { valid: false, error: 'Invalid Stellar account public key subject' };
    }
    return { valid: true };
  }
}