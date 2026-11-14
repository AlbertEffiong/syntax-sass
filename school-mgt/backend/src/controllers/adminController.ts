import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { resolvePagination } from '../utils/pagination';
import * as adminService from '../services/adminService';
import * as authService from '../services/authService';
import * as uploadService from '../services/uploadService';
import {
  CreateClassBody,
  EnrollStudentBody,
  ReviewAssessmentBody,
  AdminBankTransferBody,
  UpdateTeacherBody,
  AcademicSettingBody,
  UpdateStudentBody,
  RecordFeePaymentBody,
  DebtorControlBody,
  UpdateClassBody,
  ChangeTeacherPasswordBody,
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
 * PATCH /api/admin/classes/:id
 * Updates an existing class's name, subjects and/or form teacher.
 */
export const updateClass = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateClassBody;
  const cls = await adminService.updateClass(requireTenant(req), req.params.id, body);
  return ok(res, cls, 'Class updated.');
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

export const getStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await adminService.getStudent(requireTenant(req), req.params.id);
  return ok(res, student);
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateStudentBody;
  const student = await adminService.updateStudent(requireTenant(req), req.params.id, body);
  return ok(res, student, 'Student updated.');
});

export const recordFeePayment = asyncHandler(async (req: Request, res: Response) => {
  const { amount } = req.body as RecordFeePaymentBody;
  const student = await adminService.recordFeePayment(requireTenant(req), req.params.id, amount);
  return ok(res, student, 'Fee payment recorded.');
});

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await adminService.getDashboard(requireTenant(req));
  return ok(res, dashboard);
});

export const updateDebtorControl = asyncHandler(async (req: Request, res: Response) => {
  const { restrictDebtors } = req.body as DebtorControlBody;
  const school = await adminService.updateDebtorControl(requireTenant(req), restrictDebtors);
  return ok(res, school, 'Debtor result access policy updated.');
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

export const resendTeacherOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resendTeacherOtp(requireTenant(req), req.params.id);
  return ok(res, result, 'A new verification code has been sent.');
});

/**
 * PATCH /api/admin/teachers/:id/password
 * Changes a verified teacher's sign-in password (requires current password).
 */
export const changeTeacherPassword = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as ChangeTeacherPasswordBody;
  await adminService.changeTeacherPassword(requireTenant(req), req.params.id, body);
  return ok(res, null, 'Teacher password updated.');
});

export const getAssessmentDetails = asyncHandler(async (req: Request, res: Response) => {
  const details = await adminService.getAssessmentDetails(requireTenant(req), req.params.id);
  return ok(res, details);
});

export const reviewAssessmentGroup = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { classId: string; subject: string; term: string; session: string; action: 'approve' | 'reject'; note?: string };
  const result = await adminService.reviewAssessmentGroup({ schoolId: requireTenant(req), ...body });
  return ok(res, result, body.action === 'approve' ? 'Assessment approved.' : 'Assessment returned for revision.');
});

/**
 * GET /api/admin/pending-assessments
 */
export const deleteActivity = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteActivity(requireTenant(req), req.params.id);
  return ok(res, null, 'Activity removed.');
});

export const clearActivities = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.clearActivities(requireTenant(req));
  return ok(res, result, 'Recent activities cleared.');
});

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
  const body = req.body as ReviewAssessmentBody & { classId?: string; subject?: string; term?: string; session?: string };
  if (body.classId && body.subject && body.term && body.session) {
    const result = await adminService.reviewAssessmentGroup({
      schoolId: requireTenant(req),
      classId: body.classId,
      subject: body.subject,
      term: body.term,
      session: body.session,
      action: body.action,
      note: body.note,
    });
    return ok(res, result, `Assessment ${body.action === 'approve' ? 'approved' : 'returned for revision'}.`);
  }
  if (!body.assessmentId) throw ApiError.badRequest('assessmentId or group identifiers are required.', 'VALIDATION_ERROR');
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

export const getSubscription = asyncHandler(async (req: Request, res: Response) => {
  const subscription = await adminService.getSubscription(requireTenant(req));
  return ok(res, subscription);
});

/**
 * GET /api/admin/school
 * Returns the tenant's school profile/settings.
 */
export const getSchoolSettings = asyncHandler(async (req: Request, res: Response) => {
  const school = await adminService.getSchoolSettings(requireTenant(req));
  return ok(res, school);
});

export const getPendingPaymentReceipt = asyncHandler(async (req: Request, res: Response) => {
  const receipt = await adminService.getPendingPaymentReceipt(requireTenant(req));
  return ok(res, receipt);
});

export const updateSchoolSettings = asyncHandler(async (req: Request, res: Response) => {
  const school = await adminService.updateSchoolSettings(requireTenant(req), req.body);
  return ok(res, school, 'School profile updated.');
});

/**
 * PATCH /api/admin/school/signature
 * Multipart upload of the principal's signature. When object storage is
 * configured the file is pushed to the bucket and a public URL is stored;
 * otherwise the base64 payload is stored in the document.
 */
export const updatePrincipalSignature = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) {
    throw ApiError.badRequest('A signature image is required.', 'SIGNATURE_REQUIRED');
  }
  const stored = await uploadService.storeUpload(file);
  const school = await adminService.updateSchoolSettings(requireTenant(req), {
    principalSignature: stored,
  });
  return ok(res, school, 'Principal signature saved.');
});

/**
 * PATCH /api/admin/academic-setting
 */
export const updateAcademicSetting = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as AcademicSettingBody;
  const school = await adminService.updateAcademicSetting(requireTenant(req), body);
  return ok(res, school, 'Academic calendar updated.');
});
