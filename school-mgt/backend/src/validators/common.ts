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

/**
 * A base64-encoded image used for a signature. Reused by both the teacher
 * self-service signature upload and the admin principal-signature upload.
 */
export const signatureSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().trim().regex(/^image\/(jpeg|png|webp)$/i, 'Use a JPG, PNG or WebP image.'),
  contentBase64: z.string().trim().min(1).max(900_000).regex(/^[A-Za-z0-9+/]+={0,2}$/, 'Signature must be a base64-encoded image.'),
});

export type SignatureBody = z.infer<typeof signatureSchema>;
