import { ApiError } from './ApiError';

/**
 * IDOR guard used inside services. Confirms a resource's `schoolId` matches the
 * authenticated tenant before it is returned or mutated. If they differ (or the
 * tenant context is missing) a 403 is thrown, so cross-tenant enumeration leaks
 * nothing.
 */
export function assertSameSchool(
  resourceSchoolId: unknown,
  tenantSchoolId: string | undefined,
): void {
  if (!tenantSchoolId || String(resourceSchoolId) !== String(tenantSchoolId)) {
    throw ApiError.forbidden(
      'Resource does not belong to your school',
      'IDOR_BLOCKED',
    );
  }
}

/**
 * Normalises a Mongo `_id`-like value for safe comparison.
 */
export function idsEqual(a: unknown, b: unknown): boolean {
  return String(a) === String(b);
}
