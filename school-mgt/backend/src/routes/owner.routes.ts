import { Router } from 'express';
import * as ownerController from '../controllers/ownerController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  listSchoolsQuerySchema,
  setSchoolStatusParamsSchema,
  setSchoolStatusSchema,
  verifyPaymentSchema,
} from '../validators/owner.validators';

const router = Router();

// Every owner route requires an authenticated SaaS owner.
router.use(authenticate, authorize('owner'));

/**
 * @route  GET /api/owner/dashboard
 * @desc   MRR, active/expired school counts.
 * @access Owner
 */
router.get('/dashboard', ownerController.getDashboard);

/**
 * @route  GET /api/owner/schools
 * @desc   Paginated, filterable list of schools.
 * @access Owner
 */
router.get('/schools', validate(listSchoolsQuerySchema, 'query'), ownerController.listSchools);

/**
 * @route  PATCH /api/owner/schools/:id/status
 * @desc   Manually lock/unlock a school's subscription.
 * @access Owner
 */
router.patch(
  '/schools/:id/status',
  validate(setSchoolStatusParamsSchema, 'params'),
  validate(setSchoolStatusSchema),
  ownerController.setSchoolStatus,
);

/**
 * @route  POST /api/owner/verify-payment
 * @desc   Confirm a manual OPay bank transfer and reactivate a school.
 * @access Owner
 */
router.post('/verify-payment', validate(verifyPaymentSchema), ownerController.verifyPayment);

export default router;
