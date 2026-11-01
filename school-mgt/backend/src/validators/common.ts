import { z } from 'zod';
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from '../utils/password';

/** Reusable strong-password field. */
export const passwordSchema = z
  .string()
  .min(8, PASSWORD_POLICY_MESSAGE)
  .refine(isStrongPassword, { message: PASSWORD_POLICY_MESSAGE });

/** A 24-hex-character MongoDB ObjectId in a URL param or body field. */
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'A valid id is required.');

export const emailSchema = z.string().email('A valid email is required.').toLowerCase().trim();
