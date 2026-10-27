import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { resolvePagination } from '../utils/pagination';
import * as adminService from '../services/adminService';
import {
  CreateClassBody,
  EnrollStudentBody,
  ReviewAssessmentBody,
  AdminBankTransferBody,
  UpdateTeacherBody,
  AcademicSettingBody,
} from '../validators/admin.validators';
import { AssessmentStatus } from '../models/Assessment';

function requireTenant(req: Request): string {
  if (!req.tenantSchoolId) {
    throw ApiError.forbidden('No tenant context for this request.', 'NO_TENANT');
  }
  return req.tenantSchoolId;
}

function page(req: Request) {
  return resolvePagination(Number(req.query.page ?? 1), Number(req.query.limit ?? 20));
}

/**
 * POST /api/admin/classes
 */
export const createClass = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateClassBody;
  const cls = await adminService.createClass({ schoolId: requireTenant(req), ...body });
  return created(res, cls, 'Class created successfully.');
});

/**
 * GET /api/admin/classes
 */
export const listClasses = asyncHandler(async (req: Request, res: Response) => {
  const classes = await adminService.listClasses(requireTenant(req));
  return ok(res, classes);
});

/**
 * POST /api/admin/students
 */
export const enrollStudent = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as EnrollStudentBody;
  const student = await adminService.enrollStudent({ schoolId: requireTenant(req), ...body });
  return created(res, student, 'Student enrolled successfully.');
});

/**
 * GET /api/admin/students
 */
export const listStudents = asyncHandler(async (req: Request, res: Response) => {
  const currentClass = typeof req.query.currentClass === 'string' ? req.query.currentClass : undefined;
  const students = await adminService.listStudents(requireTenant(req), currentClass, page(req));
  return ok(res, students);
});

/**
 * GET /api/admin/teachers
 */
export const listTeachers = asyncHandler(async (req: Request, res: Response) => {
  const teachers = await adminService.listTeachers(requireTenant(req), page(req));
  return ok(res, teachers);
});

/**
 * PATCH /api/admin/teachers/:id
 */
export const updateTeacher = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateTeacherBody;
  const teacher = await adminService.updateTeacher(requireTenant(req), req.params.id, body);
  return ok(res, teacher, 'Teacher updated.');
});

/**
 * DELETE /api/admin/teachers/:id
 */
export const removeTeacher = asyncHandler(async (req: Request, res: Response) => {
  await adminService.removeTeacher(requireTenant(req), req.params.id);
  return ok(res, null, 'Teacher removed.');
});

/**
 * GET /api/admin/pending-assessments
 */
export const listAssessments = asyncHandler(async (req: Request, res: Response) => {
  const status = (req.query.status as AssessmentStatus | 'all' | undefined) ?? 'Pending Approval';
  const assessments = await adminService.listAssessments(requireTenant(req), status, page(req));
  return ok(res, assessments);
});

/**
 * POST /api/admin/pending-assessments
 * Approve or reject a teacher submission.
 */
export const reviewAssessment = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as ReviewAssessmentBody;
  const assessment = await adminService.reviewAssessment({
    schoolId: requireTenant(req),
    assessmentId: body.assessmentId,
    action: body.action,
    note: body.note,
  });
  return ok(res, assessment, `Assessment ${body.action === 'approve' ? 'approved' : 'returned for revision'}.`);
});

/**
 * POST /api/admin/subscription/bank-transfer
 */
export const submitBankTransfer = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as AdminBankTransferBody;
  const school = await adminService.submitBankTransfer({ schoolId: requireTenant(req), ...body });
  return ok(res, school, 'Payment reference submitted. Awaiting owner verification.');
});

/**
 * GET /api/admin/school
 * Returns the tenant's school profile/settings.
 */
export const getSchoolSettings = asyncHandler(async (req: Request, res: Response) => {
  const school = await adminService.getSchoolSettings(requireTenant(req));
  return ok(res, school);
});

/**
 * PATCH /api/admin/academic-setting
 */
export const updateAcademicSetting = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as AcademicSettingBody;
  const school = await adminService.updateAcademicSetting(requireTenant(req), body);
  return ok(res, school, 'Academic calendar updated.');
});
