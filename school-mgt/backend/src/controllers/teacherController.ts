import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import * as teacherService from '../services/teacherService';
import { SaveBroadsheetBody, SubmitBroadsheetBody } from '../validators/teacher.validators';

/**
 * GET /api/teacher/classes-subjects
 * Classes and subjects are returned strictly from the admin curriculum.
 */
export const getClassesSubjects = asyncHandler(async (req: Request, res: Response) => {
  const classes = await teacherService.getClassesSubjects(requireTenant(req));
  return ok(res, classes);
});

/**
 * POST /api/teacher/broadsheet/save
 * Bulk save/update CA1, CA2 and Exam scores.
 */
export const saveBroadsheet = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as SaveBroadsheetBody;
  const result = await teacherService.saveBroadsheet({
    schoolId: requireTenant(req),
    teacherId: requireTeacherId(req),
    teacherEmail: requireTeacherEmail(req),
    ...body,
  });
  return ok(res, result, 'Scores saved.');
});

/**
 * POST /api/teacher/broadsheet/submit
 * Finalise and send the broadsheet to the admin for approval.
 */
export const submitBroadsheet = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as SubmitBroadsheetBody;
  const result = await teacherService.submitBroadsheet({
    schoolId: requireTenant(req),
    teacherId: requireTeacherId(req),
    teacherEmail: requireTeacherEmail(req),
    ...body,
  });
  return ok(res, result, 'Broadsheet submitted for approval.');
});

/**
 * GET /api/teacher/broadsheet
 * Fetch the saved broadsheet for a class + subject.
 */
export const getBroadsheet = asyncHandler(async (req: Request, res: Response) => {
  const { classId, subject, term, session } = req.query as Record<string, string>;
  const rows = await teacherService.getBroadsheet(
    requireTenant(req),
    classId,
    subject,
    term,
    session,
  );
  return ok(res, rows);
});

function requireTenant(req: Request): string {
  if (!req.tenantSchoolId) {
    throw ApiError.forbidden('No tenant context for this request.', 'NO_TENANT');
  }
  return req.tenantSchoolId;
}

function requireTeacherId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

function requireTeacherEmail(req: Request): string {
  if (!req.user?.email) {
    throw ApiError.badRequest('The authenticated teacher has no email on record.', 'NO_TEACHER_EMAIL');
  }
  return req.user.email;
}
