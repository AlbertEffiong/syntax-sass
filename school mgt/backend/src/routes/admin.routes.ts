import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { enforceTenant } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import {
  academicSettingSchema,
  adminBankTransferSchema,
  createClassSchema,
  enrollStudentSchema,
  idParamsSchema,
  listAssessmentsQuerySchema,
  listStudentsQuerySchema,
  reviewAssessmentSchema,
  updateTeacherSchema,
} from '../validators/admin.validators';

const router = Router();

// All admin routes require an authenticated school admin + tenant scope.
router.use(authenticate, authorize('admin'), enforceTenant);

// --- School profile & academic calendar ---
router.get('/school', adminController.getSchoolSettings);
router.patch('/academic-setting', validate(academicSettingSchema), adminController.updateAcademicSetting);

// --- Classes (curriculum source of truth) ---
router.post('/classes', validate(createClassSchema), adminController.createClass);
router.get('/classes', adminController.listClasses);

// --- Students ---
router.post('/students', validate(enrollStudentSchema), adminController.enrollStudent);
router.get('/students', validate(listStudentsQuerySchema, 'query'), adminController.listStudents);

// --- Teachers ---
router.get('/teachers', adminController.listTeachers);
router.patch(
  '/teachers/:id',
  validate(idParamsSchema, 'params'),
  validate(updateTeacherSchema),
  adminController.updateTeacher,
);
router.delete('/teachers/:id', validate(idParamsSchema, 'params'), adminController.removeTeacher);

// --- Assessment approval workflow ---
router.get(
  '/pending-assessments',
  validate(listAssessmentsQuerySchema, 'query'),
  adminController.listAssessments,
);
router.post(
  '/pending-assessments',
  validate(reviewAssessmentSchema),
  adminController.reviewAssessment,
);

// --- Subscription ---
router.post(
  '/subscription/bank-transfer',
  validate(adminBankTransferSchema),
  adminController.submitBankTransfer,
);

export default router;
