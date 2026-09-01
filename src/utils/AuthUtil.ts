import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/index.js';

// Generate an ephemeral RSA keypair for testing/dev if env vars are missing
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const PRIVATE_KEY = config.JWT_PRIVATE_KEY || privateKey;
export const PUBLIC_KEY = config.JWT_PUBLIC_KEY || publicKey;

export interface Sep10JwtPayload {
  iss: string; // The URL of the authorization server
  sub: string; // The Stellar account ID of the client
  iat: number; // Issued at
  exp: number; // Expiration
  client_domain?: string;
}

export class AuthUtil {
  /**
   * Generates a SEP-10 compliant JWT using the RS256 algorithm.
   */
  static generateSep10Token(accountId: string, domain: string, clientDomain?: string): string {
    const payload: Partial<Sep10JwtPayload> = {
      iss: `https://${domain}/auth`,
      sub: accountId,
    };
    
    if (clientDomain) {
      payload.client_domain = clientDomain;
    }

    // Use RS256 algorithm as required by the overhaul
    return jwt.sign(payload, PRIVATE_KEY, { 
      algorithm: 'RS256',
      expiresIn: '24h' // 24 hours as specified in original sep10.service.ts
    });
  }

  /**
   * Verifies an RS256 JWT token.
   */
  static verifySep10Token(token: string): Sep10JwtPayload {
    return jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as Sep10JwtPayload;
  }
}
