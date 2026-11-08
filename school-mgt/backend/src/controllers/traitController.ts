import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';
import * as traitService from '../services/traitService';
import { UpsertStudentTraitsInput } from '../services/traitService';

/**
 * GET /api/teacher/students/:studentId/traits
 * Returns the affective / psychomotor trait ratings for a student.
 */
export const getTraits = asyncHandler(async (req: Request, res: Response) => {
  const schoolId = req.tenantSchoolId;
  if (!schoolId) {
    throw new Error('No tenant context for this request.');
  }
  const { studentId } = req.params as Record<string, string>;
  const term = typeof req.query.term === 'string' ? req.query.term : 'First Term';
  const session = typeof req.query.session === 'string' ? req.query.session : '';

  const result = await traitService.getStudentTraits(schoolId, studentId, term, session);
  return ok(res, result, 'Student traits loaded.');
});

/**
 * POST /api/teacher/students/:studentId/traits
 * Upserts the affective / psychomotor trait ratings for a student.
 */
export const upsertTraits = asyncHandler(async (req: Request, res: Response) => {
  const schoolId = req.tenantSchoolId;
  if (!schoolId) {
    throw new Error('No tenant context for this request.');
  }
  const { studentId } = req.params as Record<string, string>;
  const body = req.body as UpsertStudentTraitsInput;
  await traitService.upsertStudentTraits({
    schoolId,
    studentRef: studentId,
    term: body.term,
    session: body.session,
    affective: body.affective,
    psychomotor: body.psychomotor,
  });
  return ok(res, null, 'Student traits saved.');
});
