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
 * POST /api/owner/schools/:id/extend
 */
export const extendSubscription = asyncHandler(async (req: Request, res: Response) => {
  const school = await ownerService.extendSubscription(req.params.id);
  return ok(res, school, 'School subscription extended for 30 days.');
});

/**
 * DELETE /api/owner/schools/:id
 */
export const deleteSchool = asyncHandler(async (req: Request, res: Response) => {
  const result = await ownerService.deleteSchool(req.params.id);
  return ok(res, result, 'School and tenant data deleted.');
});

/**
 * POST /api/owner/verify-payment
 */
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as VerifyPaymentBody;
  const school = await ownerService.verifyPayment(body);
  return ok(res, school, 'Payment verified and subscription renewed for 30 days.');
});

export const getPendingPaymentReceipt = asyncHandler(async (req: Request, res: Response) => {
  const receipt = await ownerService.getPendingPaymentReceipt(req.params.id);
  return ok(res, receipt);
});

export const rejectPayment = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { schoolId: string; reference?: string };
  const school = await ownerService.rejectPayment(body);
  return ok(res, school, 'Payment submission rejected.');
});
