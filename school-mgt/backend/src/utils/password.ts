import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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

/**
 * Generates a cryptographically random strong password that satisfies the
 * platform policy (≥8 chars, upper, lower, digit, symbol). Used when the SaaS
 * owner onboards a new school so the admin password is never predictable.
 */
export function generateStrongPassword(): string {
  const lowers = 'abcdefghijklmnopqrstuvwxyz';
  const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const symbols = '!@#$%^&*()-_=+';
  const all = lowers + uppers + digits + symbols;

  const pick = (set: string) => set[crypto.randomInt(0, set.length)];

  // Guarantee the policy is met by seeding one char from each required class.
  const chars = [pick(lowers), pick(uppers), pick(digits), pick(symbols)];
  for (let i = chars.length; i < 14; i += 1) chars.push(pick(all));

  // Shuffle so the seeded classes are not in a predictable order.
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
