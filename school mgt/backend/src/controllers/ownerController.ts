import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';
import * as ownerService from '../services/ownerService';
import { SetSchoolStatusBody, VerifyPaymentBody } from '../validators/owner.validators';
import { resolvePagination } from '../utils/pagination';

/**
 * GET /api/owner/dashboard
 */
export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const dashboard = await ownerService.getDashboard();
  return ok(res, dashboard);
});

/**
 * GET /api/owner/schools
 */
export const listSchools = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const status = (req.query.status as 'Active' | 'Expired' | 'all' | undefined) ?? 'all';
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const schools = await ownerService.listSchools({ ...resolvePagination(page, limit), status, q });
  return ok(res, schools);
});

/**
 * PATCH /api/owner/schools/:id/status
 */
export const setSchoolStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as SetSchoolStatusBody;
  const school = await ownerService.setSchoolStatus(req.params.id, status);
  return ok(res, school, `School subscription set to ${status}.`);
});

/**
 * POST /api/owner/verify-payment
 */
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as VerifyPaymentBody;
  const school = await ownerService.verifyPayment(body);
  return ok(res, school, 'Payment verified. Subscription reactivated for 30 days.');
});
