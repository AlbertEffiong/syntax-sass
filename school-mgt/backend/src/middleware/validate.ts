import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError';

type Source = 'body' | 'query' | 'params';

/**
 * Validates and coerces `req[source]` against a Zod schema. On success the
 * parsed value replaces the raw input; on failure a 400 with field-level details
 * is raised.
 */
export function validate(schema: ZodTypeAny, source: Source = 'body'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = formatZodError(result.error);
      return next(ApiError.badRequest('Validation failed', 'VALIDATION_ERROR', details));
    }
    // Assign back the parsed (typed, coerced) value.
    (req as unknown as Record<Source, unknown>)[source] = result.data;
    return next();
  };
}

function formatZodError(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}
