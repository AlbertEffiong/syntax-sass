import { z } from 'zod';
import { emailSchema, passwordSchema } from './common';

export const registerSchoolSchema = z.object({
  name: z.string().min(2, 'School name is required.').trim(),
  email: emailSchema,
  password: passwordSchema,
  uniqueSchoolPrefix: z
    .string()
    .regex(/^[A-Za-z]{2,6}$/, 'Prefix must be 2-6 letters.')
    .transform((v) => v.toUpperCase()),
  principalName: z.string().trim().optional(),
  planMonthly: z.number().nonnegative().optional(),
  subscriptionStatus: z.enum(['Active', 'Expired']).optional(),
});

export const loginSchema = z.object({
  role: z.enum(['owner', 'admin', 'teacher', 'student']),
  email: emailSchema.optional(),
  studentId: z.string().trim().min(1).optional(),
  password: z.string().min(1, 'Password is required.'),
});

export const inviteTeacherSchema = z.object({
  name: z.string().min(2, 'Teacher name is required.').trim(),
  email: emailSchema,
  subject: z.string().trim().optional(),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit code.'),
  password: passwordSchema,
});

export type RegisterSchoolBody = z.infer<typeof registerSchoolSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type InviteTeacherBody = z.infer<typeof inviteTeacherSchema>;
export type VerifyOtpBody = z.infer<typeof verifyOtpSchema>;
