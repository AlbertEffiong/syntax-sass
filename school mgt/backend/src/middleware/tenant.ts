import { NextFunction, Request, RequestHandler, Response } from 'express';
import { School, isSubscriptionActive } from '../models/School';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { TENANT_ROLES } from '../types';

/**
 * Tenant-isolation / IDOR-prevention middleware.
 *
 * For every request made by a tenant-scoped role (admin, teacher, student) it:
 *   1. requires a `schoolId` on the authenticated principal, and
 *   2. rejects the request if any explicit `schoolId` is supplied that does not
 *      match the principal's own school.
 *
 * It then publishes `req.tenantSchoolId`, the ONLY school id controllers are
 * allowed to use in queries. This prevents a caller from reading or mutating
 * another school's students, classes or grades by swapping an id.
 */
export const enforceTenant = (req: Request, _res: Response, next: NextFunction): void => {
  const user = req.user;
  if (!user) {
    return next(ApiError.unauthorized());
  }

  if (TENANT_ROLES.includes(user.role)) {
    if (!user.schoolId) {
      return next(ApiError.forbidden('No school is associated with this account.', 'NO_TENANT'));
    }

    const supplied = extractSchoolId(req);
    if (supplied && supplied !== String(user.schoolId)) {
      return next(
        ApiError.forbidden('Cross-tenant access is not permitted.', 'IDOR_BLOCKED'),
      );
    }

    req.tenantSchoolId = String(user.schoolId);
  }

  return next();
};

/**
 * Collects any school id a client attempted to pass via params, body or query.
 */
function extractSchoolId(req: Request): string | undefined {
  const candidates: unknown[] = [
    req.params?.schoolId,
    (req.body as Record<string, unknown> | undefined)?.schoolId,
    req.query?.schoolId,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
  }
  return undefined;
}

/**
 * Loads the tenant's School document onto `req.school` (requires
 * `req.tenantSchoolId`). Used by subscription-gated routes.
 */
export const loadSchool = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.tenantSchoolId) {
    throw ApiError.forbidden('No tenant context for this request.', 'NO_TENANT');
  }
  const school = await School.findById(req.tenantSchoolId);
  if (!school) {
    throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  }
  req.school = school;
  return next();
});

/**
 * Blocks access when the school's subscription is not active. Intended for the
 * student/parent result portal (and any other paid feature).
 */
export const requireActiveSubscription: RequestHandler = (req, _res, next) => {
  const school = req.school;
  if (!school) {
    return next(ApiError.internal('Subscription check ran without a loaded school.'));
  }
  if (!isSubscriptionActive(school)) {
    return next(
      ApiError.forbidden(
        'The result portal is locked because the school subscription is not active.',
        'SUBSCRIPTION_INACTIVE',
      ),
    );
  }
  return next();
};
