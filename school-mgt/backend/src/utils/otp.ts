import crypto from 'crypto';
import { hashPassword, verifyPassword } from './password';

/** How long a teacher invitation OTP remains valid. */
export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export interface OtpResult {
  /** Plaintext OTP — deliver out-of-band (email/SMS), never persist. */
  code: string;
  /** bcrypt hash persisted on the teacher record. */
  hash: string;
  expiresAt: Date;
}

/**
 * Generates a 6-digit numeric OTP and a bcrypt hash + expiry for storage.
 */
export async function generateOtp(): Promise<OtpResult> {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  const hash = await hashPassword(code);
  return { code, hash, expiresAt: new Date(Date.now() + OTP_TTL_MS) };
}

/**
 * Verifies a candidate OTP against the stored hash, enforcing expiry.
 */
export function verifyOtp(code: string, hash: string, expiresAt: Date | null | undefined): Promise<boolean> {
  if (!expiresAt || expiresAt.getTime() < Date.now()) return Promise.resolve(false);
  return verifyPassword(code, hash);
}
