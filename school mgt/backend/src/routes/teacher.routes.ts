import { Router } from 'express';
import * as teacherController from '../controllers/teacherController';
import { authenticate, authorize } from '../middleware/auth';
import { enforceTenant } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import {
  broadsheetQuerySchema,
  saveBroadsheetSchema,
  submitBroadsheetSchema,
} from '../validators/teacher.validators';

const router = Router();

// All teacher routes require an authenticated teacher + tenant scope.
router.use(authenticate, authorize('teacher'), enforceTenant);

/**
 * @route  GET /api/teacher/classes-subjects
 * @desc   Classes + subjects synced strictly from the admin curriculum.
 * @access Teacher
 */
router.get('/classes-subjects', teacherController.getClassesSubjects);

/**
 * @route  GET /api/teacher/broadsheet
 * @desc   Fetch a saved broadsheet for a class + subject + term.
 * @access Teacher
 */
router.get('/broadsheet', validate(broadsheetQuerySchema, 'query'), teacherController.getBroadsheet);

/**
 * @route  POST /api/teacher/broadsheet/save
 * @desc   Save/update CA1, CA2 and Exam scores.
 * @access Teacher
 */
router.post('/broadsheet/save', validate(saveBroadsheetSchema), teacherController.saveBroadsheet);

/**
 * @route  POST /api/teacher/broadsheet/submit
 * @desc   Submit finalised scores to the admin for approval.
 * @access Teacher
 */
router.post(
  '/broadsheet/submit',
  validate(submitBroadsheetSchema),
  teacherController.submitBroadsheet,
);

export default router;
