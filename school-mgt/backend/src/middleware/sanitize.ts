import { NextFunction, Request, RequestHandler, Response } from 'express';

/** True when a key would be interpreted as a Mongo operator or dotted path. */
function isForbiddenKey(key: string): boolean {
  return key.startsWith('$') || key.includes('.');
}

/**
 * Recursively removes keys that begin with `$` or contain a `.` from untrusted
 * input. This blocks MongoDB operator injection (e.g. `{ email: { $ne: null } }`)
 * and dotted-path injection that Mongoose could otherwise interpret as a query
 * operator/path. Values are left untouched so validation still sees them.
 */
function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (isForbiddenKey(key)) {
        continue; // drop dangerous key
      }
      result[key] = sanitize(val);
    }
    return result;
  }
  return value;
}

/**
 * Express middleware applying the sanitizer to the request body, query and
 * params. Runs before validation/controllers so downstream code only ever sees
 * safe input.
 */
export const sanitizeInput: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    // `req.query` is writable on Express 4; cast to satisfy the type checker.
    (req as unknown as { query: unknown }).query = sanitize(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitize(req.params) as typeof req.params;
  }
  next();
};
