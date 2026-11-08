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
  updateStudentSchema,
  updateClassSchema,
  recordFeePaymentSchema,
  debtorControlSchema,
} from '../validators/admin.validators';

const router = Router();

// All admin routes require an authenticated school admin + tenant scope.
router.use(authenticate, authorize('admin'), enforceTenant);

// --- School profile & academic calendar ---
router.get('/school', adminController.getSchoolSettings);
router.patch('/school', adminController.updateSchoolSettings);
router.get('/dashboard', adminController.getDashboard);
router.patch('/debtor-control', validate(debtorControlSchema), adminController.updateDebtorControl);
router.patch('/academic-setting', validate(academicSettingSchema), adminController.updateAcademicSetting);

// --- Classes (curriculum source of truth) ---
  router.post('/classes', validate(createClassSchema), adminController.createClass);
  router.patch('/classes/:id', validate(idParamsSchema, 'params'), validate(updateClassSchema), adminController.updateClass);
  router.get('/classes', adminController.listClasses);

// --- Students ---
router.post('/students', validate(enrollStudentSchema), adminController.enrollStudent);
router.get('/students', validate(listStudentsQuerySchema, 'query'), adminController.listStudents);
router.get('/students/:id', validate(idParamsSchema, 'params'), adminController.getStudent);
router.patch('/students/:id', validate(idParamsSchema, 'params'), validate(updateStudentSchema), adminController.updateStudent);
router.post('/students/:id/payments', validate(idParamsSchema, 'params'), validate(recordFeePaymentSchema), adminController.recordFeePayment);

// --- Teachers ---
router.get('/teachers', adminController.listTeachers);
router.patch(
  '/teachers/:id',
  validate(idParamsSchema, 'params'),
  validate(updateTeacherSchema),
  adminController.updateTeacher,
);
router.delete('/teachers/:id', validate(idParamsSchema, 'params'), adminController.removeTeacher);
router.post('/teachers/:id/resend-otp', validate(idParamsSchema, 'params'), adminController.resendTeacherOtp);

// --- Assessment approval workflow ---
router.get(
  '/pending-assessments',
  validate(listAssessmentsQuerySchema, 'query'),
  adminController.listAssessments,
);
router.get(
  '/pending-assessments/:id',
  validate(idParamsSchema, 'params'),
  adminController.getAssessmentDetails,
);
router.post(
  '/pending-assessments',
  validate(reviewAssessmentSchema),
  adminController.reviewAssessment,
);
router.post(
  '/pending-assessments/review-group',
  validate(reviewAssessmentSchema),
  adminController.reviewAssessmentGroup,
);

// --- Subscription ---
router.post(
  '/subscription/bank-transfer',
  validate(adminBankTransferSchema),
  adminController.submitBankTransfer,
);
router.get('/subscription', adminController.getSubscription);
router.get('/subscription/receipt', adminController.getPendingPaymentReceipt);

// --- Recent activity (school dashboard) ---
router.delete('/activities', adminController.clearActivities);
router.delete('/activities/:id', validate(idParamsSchema, 'params'), adminController.deleteActivity);

export default router;
