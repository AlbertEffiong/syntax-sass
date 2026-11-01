import crypto from 'crypto';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

/** HTTP methods that mutate state and therefore require CSRF validation. */
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Unauthenticated entry points that establish the session itself. They cannot
 * carry a pre-existing CSRF cookie, so they are exempt (login CSRF is mitigated
 * by SameSite=strict on the session cookie).
 */
const EXEMPT = new Set([
  'POST /api/auth/login',
  'POST /api/auth/register-school',
  'POST /api/auth/verify-otp',
  'POST /api/student/login',
]);

/**
 * Issues a fresh CSRF token as a readable (non-httpOnly) cookie so the SPA can
 * echo it back in the `x-csrf-token` header. Returns the token so it can also be
 * returned in a response body for non-cookie clients during login.
 */
export function issueCsrfToken(res: Response): string {
  const token = crypto.randomBytes(24).toString('hex');
  res.cookie(env.cookies.csrfName, token, {
    httpOnly: false,
    sameSite: 'strict',
    secure: env.cookies.secure,
    domain: env.cookies.domain,
    path: '/',
  });
  return token;
}

/**
 * SameSite cookies already stop most cross-site form posts, but we add an
 * explicit double-submit token check for defence in depth.
 *
 * Rules:
 *  - Safe methods (GET/HEAD/OPTIONS) pass through.
 *  - Bearer-token requests (stateless API clients) are exempt, since they do not
 *    rely on ambient cookies and thus have no CSRF exposure.
 *  - Cookie-authenticated state-changing requests must present an
 *    `x-csrf-token` header matching the `csrfToken` cookie.
 */
export const csrfProtection: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  if (!UNSAFE_METHODS.has(req.method.toUpperCase())) {
    return next();
  }

  if (EXEMPT.has(`${req.method.toUpperCase()} ${req.path}`)) {
    return next();
  }

  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return next();
  }

  const cookieToken = req.cookies?.[env.cookies.csrfName] as string | undefined;
  const providedToken = req.headers['x-csrf-token'];
  const provided = Array.isArray(providedToken) ? providedToken[0] : providedToken;

  if (!cookieToken || !provided || !timingSafeEqual(cookieToken, provided)) {
    return next(
      ApiError.forbidden('Invalid or missing CSRF token.', 'CSRF_FAILED'),
    );
  }

  return next();
};

/** Constant-time string comparison to avoid timing side channels. */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
