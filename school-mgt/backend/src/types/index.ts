import { Types } from 'mongoose';

/** The four actor roles supported by the platform. */
export type Role = 'owner' | 'admin' | 'teacher' | 'student';

/** Roles that are always scoped to a single tenant (school). */
export const TENANT_ROLES: Role[] = ['admin', 'teacher', 'student'];

/** Decoded JWT payload / authenticated principal attached to each request. */
export interface AuthUser {
  /** Mongo `_id` of the owning document (Owner / School / Teacher / Student). */
  id: string;
  role: Role;
  /** Present for admin, teacher and student; absent for the SaaS owner. */
  schoolId?: string;
  email?: string;
}

/** Raw JWT payload as signed into the token. */
export interface JwtPayload {
  sub: string;
  role: Role;
  schoolId?: string;
  email?: string;
}

/** Generic map of route params (kept small to avoid depending on Express internals). */
export type IdParams = { id: string };

export const toId = (value: string | Types.ObjectId): string => String(value);

/** Standard success envelope returned by every controller. */
export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

/** Standard error envelope returned by the central error handler. */
export interface ApiErrorBody {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
