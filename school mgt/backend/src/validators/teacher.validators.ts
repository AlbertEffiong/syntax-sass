import { z } from 'zod';
import { objectIdSchema } from './common';

const scoreSchema = z.object({
  studentId: z.string().trim().min(1, 'Student id is required.'),
  ca1: z.number().min(0).max(20),
  ca2: z.number().min(0).max(20),
  exam: z.number().min(0).max(60),
});

export const broadsheetKeySchema = z.object({
  classId: objectIdSchema,
  subject: z.string().trim().min(1, 'Subject is required.'),
  term: z.string().trim().min(1, 'Term is required.'),
  session: z.string().trim().min(1, 'Session is required.'),
});

export const saveBroadsheetSchema = broadsheetKeySchema.extend({
  entries: z.array(scoreSchema).min(1, 'At least one score entry is required.'),
});

export const submitBroadsheetSchema = broadsheetKeySchema.extend({
  principalName: z.string().trim().optional(),
});

export const broadsheetQuerySchema = broadsheetKeySchema;

export type SaveBroadsheetBody = z.infer<typeof saveBroadsheetSchema>;
export type SubmitBroadsheetBody = z.infer<typeof submitBroadsheetSchema>;
