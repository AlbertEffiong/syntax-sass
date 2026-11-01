import { NextFunction, Request, RequestHandler, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyToken } from '../utils/jwt';
import { Role } from '../types';

/**
 * Extracts a bearer token from the Authorization header or the httpOnly auth
 * cookie, verifies it and attaches the principal to `req.user`.
 */
export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    token = header.slice('Bearer '.length).trim();
  } else if (req.cookies?.[env.cookies.authName]) {
    token = req.cookies[env.cookies.authName] as string;
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication required. Provide a bearer token or session cookie.');
  }

  const payload = verifyToken(token);
  req.user = {
    id: payload.sub,
    role: payload.role,
    schoolId: payload.schoolId,
    email: payload.email,
  };

  return next();
});

/**
 * Role gate. Must run after `authenticate`.
 */
export function authorize(...roles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `This action requires one of the following roles: ${roles.join(', ')}.`,
          'ROLE_FORBIDDEN',
        ),
      );
    }
    return next();
  };
}
