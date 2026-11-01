import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

/**
 * Aggressive limiter applied to authentication / login endpoints to blunt
 * brute-force and credential-stuffing attempts.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  // Do not count successful logins against the limit.
  skipSuccessfulRequests: true,
  handler: (_req, _res, next) => {
    next(
      ApiError.badRequest(
        'Too many authentication attempts. Please try again later.',
        'RATE_LIMITED',
      ),
    );
  },
});

/**
 * A softer global limiter guarding the whole API surface.
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max * 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.badRequest('Too many requests. Please slow down.', 'RATE_LIMITED'));
  },
});
