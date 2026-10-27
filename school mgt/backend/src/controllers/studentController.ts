import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';
import { establishSession } from '../utils/session';
import { ApiError } from '../utils/ApiError';
import * as authService from '../services/authService';
import * as studentService from '../services/studentService';
import { StudentLoginBody } from '../validators/student.validators';

/**
 * POST /api/student/login
 * Student/parent login using Student ID + password.
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as StudentLoginBody;
  const result = await authService.login({
    role: 'student',
    studentId: body.studentId,
    password: body.password,
  });
  const session = establishSession(res, result.authUser);
  return ok(res, { user: result.user, token: session.token, csrfToken: session.csrfToken }, 'Login successful.');
});

/**
 * GET /api/student/results
 * Returns the termly report card. Access is gated by the tenant's active
 * subscription (enforced by `requireActiveSubscription` upstream).
 */
export const getResults = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const term = typeof req.query.term === 'string' ? req.query.term : undefined;
  const session = typeof req.query.session === 'string' ? req.query.session : undefined;

  const report = await studentService.getResults({
    schoolId: requireTenant(req),
    studentRef: req.user.id,
    term,
    session,
  });
  return ok(res, report);
});

function requireTenant(req: Request): string {
  if (!req.tenantSchoolId) {
    throw ApiError.forbidden('No tenant context for this request.', 'NO_TENANT');
  }
  return req.tenantSchoolId;
}
