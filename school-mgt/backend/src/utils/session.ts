import { Response } from 'express';
import { env } from '../config/env';
import { signToken } from './jwt';
import { issueCsrfToken } from '../middleware/csrf';
import { AuthUser } from '../types';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface SessionTokens {
  token: string;
  csrfToken: string;
}

/**
 * Signs a JWT for the principal and installs:
 *  - an httpOnly, SameSite=strict auth cookie, and
 *  - a readable CSRF cookie for the double-submit pattern.
 *
 * The raw token is also returned so stateless clients can use Bearer auth.
 */
export function establishSession(res: Response, authUser: AuthUser): SessionTokens {
  const token = signToken({
    sub: authUser.id,
    role: authUser.role,
    schoolId: authUser.schoolId,
    email: authUser.email,
  });

  res.cookie(env.cookies.authName, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.cookies.secure,
    domain: env.cookies.domain,
    path: '/',
    maxAge: ONE_DAY_MS,
  });

  const csrfToken = issueCsrfToken(res);
  return { token, csrfToken };
}

/**
 * Clears the auth and CSRF cookies on logout.
 */
export function clearSession(res: Response): void {
  const base = { path: '/', domain: env.cookies.domain, secure: env.cookies.secure } as const;
  res.clearCookie(env.cookies.authName, { ...base, httpOnly: true, sameSite: 'strict' });
  res.clearCookie(env.cookies.csrfName, { ...base, httpOnly: false, sameSite: 'strict' });
}
