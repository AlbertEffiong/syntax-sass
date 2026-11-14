import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { serializeTeacher } from '../utils/serialize';
import * as teacherService from '../services/teacherService';
import * as uploadService from '../services/uploadService';
import { SaveBroadsheetBody, SubmitBroadsheetBody } from '../validators/teacher.validators';

/**
 * GET /api/teacher/classes-subjects
 * Classes and subjects are returned strictly from the admin curriculum.
 */
export const getClassesSubjects = asyncHandler(async (req: Request, res: Response) => {
  const classes = await teacherService.getClassesSubjects(requireTenant(req));
  return ok(res, classes);
});

export const getContext = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await teacherService.getTeacherContext(requireTenant(req), requireTeacherId(req)));
});

export const getClassRoster = asyncHandler(async (req: Request, res: Response) => {
  const classId = String(req.query.classId || '');
  return ok(res, await teacherService.getClassRoster(requireTenant(req), classId));
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

export const notifyAdminSetup = asyncHandler(async (req: Request, res: Response) => {
  const result = await teacherService.notifyAdminSetup(requireTenant(req), requireTeacherId(req));
  return ok(res, result, 'Admin notified to set up Classes & Subjects.');
});

/**
 * PATCH /api/teacher/me/signature
 * The authenticated teacher uploads their own signature (multipart file),
 * which is rendered on printed results. Falls back to base64-in-document
 * storage when no object storage is configured.
 */
export const updateMySignature = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) {
    throw ApiError.badRequest('A signature image is required.', 'SIGNATURE_REQUIRED');
  }
  const stored = await uploadService.storeUpload(file);
  const teacher = await teacherService.updateTeacherSignature(
    requireTenant(req),
    requireTeacherId(req),
    stored,
  );
  return ok(res, serializeTeacher(teacher), 'Signature saved.');
});

function requireTeacherEmail(req: Request): string {
  if (!req.user?.email) {
    throw ApiError.badRequest('The authenticated teacher has no email on record.', 'NO_TEACHER_EMAIL');
  }
  return req.user.email;
}
