import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from './ApiError';
import { JwtPayload } from '../types';

/**
 * Signs a short-lived JWT for the authenticated principal.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifies a JWT and returns its payload, throwing a 401 ApiError when the
 * token is missing, malformed or expired.
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.jwt.secret);
    if (typeof decoded === 'string') {
      throw new Error('Unexpected token payload');
    }
    return decoded as JwtPayload;
  } catch {
    throw ApiError.unauthorized('Invalid or expired session token', 'INVALID_TOKEN');
  }
}
