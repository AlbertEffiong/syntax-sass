import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';
import { enforceTenant, loadSchool, requireActiveSubscription } from '../middleware/tenant';
import { authRateLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { resultsQuerySchema, studentLoginSchema } from '../validators/student.validators';

const router = Router();

/**
 * @route  POST /api/student/login
 * @desc   Student/parent login with Student ID + password. Rate-limited.
 * @access Public
 */
router.post('/login', authRateLimiter, validate(studentLoginSchema), studentController.login);

/**
 * @route  GET /api/student/results
 * @desc   Termly report card, only when the school's subscription is active.
 * @access Student (tenant-scoped + active subscription)
 */
router.get(
  '/results',
  authenticate,
  authorize('student'),
  enforceTenant,
  loadSchool,
  requireActiveSubscription,
  validate(resultsQuerySchema, 'query'),
  studentController.getResults,
);

export default router;
