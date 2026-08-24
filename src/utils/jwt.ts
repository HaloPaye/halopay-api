import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-do-not-use-in-prod';
const JWT_EXPIRES_IN = '15m'; // SEP-10 tokens must be short-lived

export interface Sep10JwtPayload {
  iss: string; // The URL of the authorization server
  sub: string; // The Stellar account ID of the client
  iat: number; // Issued at
  exp: number; // Expiration
  client_domain?: string;
}

export function generateSep10Token(accountId: string, domain: string, clientDomain?: string): string {
  const payload: Partial<Sep10JwtPayload> = {
    iss: domain,
    sub: accountId,
  };
  
  if (clientDomain) {
    payload.client_domain = clientDomain;
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifySep10Token(token: string): Sep10JwtPayload {
  return jwt.verify(token, JWT_SECRET) as Sep10JwtPayload;
}
