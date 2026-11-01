import { z } from 'zod';
import { objectIdSchema } from './common';
import { paginationSchema } from '../utils/pagination';

export const setSchoolStatusSchema = z.object({
  status: z.enum(['Active', 'Expired']),
});

export const setSchoolStatusParamsSchema = z.object({
  id: objectIdSchema,
});

export const verifyPaymentSchema = z.object({
  schoolId: objectIdSchema,
  reference: z.string().trim().min(3, 'A payment reference is required.'),
  amount: z.number().nonnegative().optional(),
});

export const listSchoolsQuerySchema = paginationSchema.extend({
  status: z.enum(['Active', 'Expired', 'all']).optional(),
  q: z.string().trim().optional(),
});

export const schoolIdParamsSchema = z.object({
  id: objectIdSchema,
});

export type SetSchoolStatusBody = z.infer<typeof setSchoolStatusSchema>;
export type VerifyPaymentBody = z.infer<typeof verifyPaymentSchema>;
