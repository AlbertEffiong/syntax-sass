import bcrypt from 'bcryptjs';
import { env } from '../config/env';

/**
 * Strong password policy:
 *  - at least 8 characters
 *  - at least one lowercase letter
 *  - at least one uppercase letter
 *  - at least one number
 *  - at least one special character
 */
export const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 8 characters long and include an uppercase letter, ' +
  'a lowercase letter, a number and a special character.';

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function isStrongPassword(password: string): boolean {
  return typeof password === 'string' && STRONG_PASSWORD.test(password);
}

/**
 * Hashes a plaintext password with bcrypt. Never store plaintext anywhere.
 */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.bcryptRounds);
}

/**
 * Compares a plaintext candidate against a stored bcrypt hash.
 */
export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
