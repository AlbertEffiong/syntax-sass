import { z } from 'zod';

export const studentLoginSchema = z.object({
  studentId: z.string().trim().min(1, 'Student ID is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export const resultsQuerySchema = z.object({
  term: z.string().trim().optional(),
  session: z.string().trim().optional(),
});

export type StudentLoginBody = z.infer<typeof studentLoginSchema>;
export type ResultsQuery = z.infer<typeof resultsQuerySchema>;
