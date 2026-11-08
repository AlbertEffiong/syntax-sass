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

export const rosterQuerySchema = z.object({
  classId: objectIdSchema,
});

const traitRatingSchema = z.object({
  trait: z.string().trim().min(1, 'Trait name is required.'),
  rating: z.string().trim().min(1, 'Rating is required.'),
});

export const studentIdParamsSchema = z.object({
  studentId: objectIdSchema,
});

export const studentTraitsQuerySchema = z.object({
  term: z.string().trim().min(1).optional(),
  session: z.string().trim().min(1).optional(),
});

export const upsertStudentTraitsSchema = z.object({
  term: z.string().trim().min(1, 'Term is required.'),
  session: z.string().trim().min(1, 'Session is required.'),
  affective: z.array(traitRatingSchema).default([]),
  psychomotor: z.array(traitRatingSchema).default([]),
});

export type SaveBroadsheetBody = z.infer<typeof saveBroadsheetSchema>;
export type SubmitBroadsheetBody = z.infer<typeof submitBroadsheetSchema>;
export type UpsertStudentTraitsBody = z.infer<typeof upsertStudentTraitsSchema>;
