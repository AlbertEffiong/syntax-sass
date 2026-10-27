import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { enforceTenant } from '../middleware/tenant';
import { authRateLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import {
  inviteTeacherSchema,
  loginSchema,
  registerSchoolSchema,
  verifyOtpSchema,
} from '../validators/auth.validators';

const router = Router();

/**
 * @route  POST /api/auth/register-school
 * @desc   SaaS Owner onboards a school. Rate-limited.
 * @access Owner
 */
router.post(
  '/register-school',
  authRateLimiter,
  authenticate,
  authorize('owner'),
  validate(registerSchoolSchema),
  authController.registerSchool,
);

/**
 * @route  POST /api/auth/login
 * @desc   Multi-role login. Rate-limited against brute force.
 * @access Public
 */
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);

/**
 * @route  POST /api/auth/invite-teacher
 * @desc   School admin invites a teacher (OTP activation).
 * @access Admin (tenant-scoped)
 */
router.post(
  '/invite-teacher',
  authenticate,
  authorize('admin'),
  enforceTenant,
  validate(inviteTeacherSchema),
  authController.inviteTeacher,
);

/**
 * @route  POST /api/auth/verify-otp
 * @desc   Activate a teacher with the email OTP.
 * @access Public
 */
router.post('/verify-otp', authRateLimiter, validate(verifyOtpSchema), authController.verifyOtp);

/**
 * @route  GET /api/auth/me
 * @desc   Current principal.
 * @access Authenticated
 */
router.get('/me', authenticate, authController.me);

/**
 * @route  POST /api/auth/logout
 * @desc   Clear session cookies.
 * @access Authenticated
 */
router.post('/logout', authenticate, authController.logout);

export default router;
