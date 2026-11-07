import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/response';
import { establishSession, clearSession } from '../utils/session';
import { ApiError } from '../utils/ApiError';
import { signToken } from '../utils/jwt';
import * as authService from '../services/authService';
import { RegisterSchoolBody, LoginBody, InviteTeacherBody, VerifyOtpBody } from '../validators/auth.validators';

/**
 * POST /api/auth/register-school
 * SaaS Owner onboards a new school (creates the school admin's credentials).
 * A secure password is generated server-side and emailed to the admin.
 */
export const registerSchool = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterSchoolBody;
  const result = await authService.registerSchool(body);
  return created(res, result, 'School registered successfully. Credentials emailed to the admin.');
});

/**
 * POST /api/auth/login
 * Role-aware login for owner, admin, teacher and student.
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as LoginBody;
  const result = await authService.login(body);
  const session = establishSession(res, result.authUser);
  return ok(res, { user: result.user, token: session.token, csrfToken: session.csrfToken }, 'Login successful.');
});

/**
 * POST /api/auth/invite-teacher
 * School admin invites a teacher (triggers OTP activation).
 */
export const inviteTeacher = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as InviteTeacherBody;
  const result = await authService.inviteTeacher({
    schoolId: requireTenant(req),
    name: body.name,
    email: body.email,
    subject: body.subject,
    classesTaught: body.classesTaught,
    status: body.status,
    initialPassword: body.initialPassword,
  });
  return created(res, result, 'Teacher invited. An OTP has been sent for verification.');
});

/**
 * POST /api/auth/verify-otp
 * Activates a teacher using the OTP and sets their password. Establishes a
 * session so the teacher is immediately signed in after verification.
 */
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as VerifyOtpBody;
  const teacher = await authService.activateTeacherWithOtp(body);
  const session = establishSession(res, {
    id: teacher.id,
    role: 'teacher',
    schoolId: teacher.schoolId,
    email: teacher.email,
  });
  return ok(res, { user: teacher, token: session.token, csrfToken: session.csrfToken }, 'Teacher account activated successfully.');
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated principal.
 */
export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const token = signToken({
    sub: req.user.id,
    role: req.user.role,
    schoolId: req.user.schoolId,
    email: req.user.email,
  });
  return ok(res, { user: req.user, token });
});

/**
 * POST /api/auth/logout
 * Clears the session cookies.
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearSession(res);
  return ok(res, null, 'Logged out.');
});

function requireTenant(req: Request): string {
  if (!req.tenantSchoolId) {
    throw ApiError.forbidden('No tenant context for this request.', 'NO_TENANT');
  }
  return req.tenantSchoolId;
}
