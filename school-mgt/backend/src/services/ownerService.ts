import { School, isSubscriptionActive } from '../models/School';
import { Student } from '../models/Student';
import { ApiError } from '../utils/ApiError';
import { serializeSchool, SchoolPublic } from '../utils/serialize';
import { paginate, Paginated, Pagination } from '../utils/pagination';

export interface OwnerDashboard {
  mrr: number;
  totalSchools: number;
  activeSchools: number;
  expiredSchools: number;
  totalStudents: number;
  activeSubscriptions: number;
}

export interface VerifyPaymentInput {
  schoolId: string;
  reference: string;
  amount?: number;
}

export interface ListSchoolsFilter extends Pagination {
  status?: 'Active' | 'Expired' | 'all';
  q?: string;
}

export interface SchoolSummary extends SchoolPublic {
  isActive: boolean;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Paginated, filterable list of all schools for the owner console.
 */
export async function listSchools(filter: ListSchoolsFilter): Promise<Paginated<SchoolSummary>> {
  const now = new Date();
  const conditions: Record<string, unknown>[] = [];

  if (filter.q) {
    const rx = new RegExp(escapeRegex(filter.q), 'i');
    conditions.push({ $or: [{ name: rx }, { email: rx }, { uniqueSchoolPrefix: rx }] });
  }
  if (filter.status === 'Active') {
    conditions.push({ subscriptionStatus: 'Active', subscriptionExpiresAt: { $gt: now } });
  } else if (filter.status === 'Expired') {
    conditions.push({
      $or: [{ subscriptionStatus: 'Expired' }, { subscriptionExpiresAt: { $lte: now } }],
    });
  }

  const query = conditions.length ? { $and: conditions } : {};
  const [rows, total] = await Promise.all([
    School.find(query).sort({ createdAt: -1 }).skip(filter.skip).limit(filter.limit),
    School.countDocuments(query),
  ]);

  const items = rows.map((s) => ({ ...serializeSchool(s), isActive: isSubscriptionActive(s) }));
  return paginate(items, total, filter.page, filter.limit);
}

/**
 * Aggregated platform metrics for the SaaS owner dashboard.
 */
export async function getDashboard(): Promise<OwnerDashboard> {
  const [schools, totalStudents] = await Promise.all([
    School.find().lean(),
    Student.estimatedDocumentCount(),
  ]);

  let mrr = 0;
  let activeSchools = 0;
  let expiredSchools = 0;

  for (const school of schools) {
    if (isSubscriptionActive(school)) {
      activeSchools += 1;
      mrr += school.planMonthly ?? 0;
    } else {
      expiredSchools += 1;
    }
  }

  return {
    mrr,
    totalSchools: schools.length,
    activeSchools,
    expiredSchools,
    totalStudents,
    activeSubscriptions: activeSchools,
  };
}

/**
 * Manually lock or unlock a school's subscription.
 */
export async function setSchoolStatus(
  schoolId: string,
  status: 'Active' | 'Expired',
): Promise<SchoolPublic> {
  const school = await School.findById(schoolId);
  if (!school) {
    throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  }

  school.subscriptionStatus = status;
  if (status === 'Active' && school.subscriptionExpiresAt.getTime() <= Date.now()) {
    // Re-activating an expired plan always grants a fresh 30-day window.
    school.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  await school.save();
  return serializeSchool(school);
}

/**
 * Confirms a manual OPay bank transfer (account details configured via env) and
 * reactivates the school's subscription for another 30 days.
 */
export async function verifyPayment(input: VerifyPaymentInput): Promise<SchoolPublic> {
  const school = await School.findById(input.schoolId);
  if (!school) {
    throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  }

  const pending = school.pendingPayment;
  if (!pending) {
    throw ApiError.badRequest(
      'No pending bank transfer found for this school.',
      'NO_PENDING_PAYMENT',
    );
  }

  // If the owner supplies a reference it must match what the school submitted.
  if (input.reference && pending.reference && input.reference !== pending.reference) {
    throw ApiError.badRequest(
      'The supplied payment reference does not match the pending submission.',
      'REFERENCE_MISMATCH',
    );
  }

  // Extend from the later of now or the current expiry.
  const base = school.subscriptionExpiresAt.getTime() > Date.now()
    ? school.subscriptionExpiresAt.getTime()
    : Date.now();

  school.subscriptionStatus = 'Active';
  school.subscriptionExpiresAt = new Date(base + 30 * 24 * 60 * 60 * 1000);
  school.pendingPayment = undefined;
  await school.save();

  return serializeSchool(school);
}
