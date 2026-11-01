import { NextFunction, Request, RequestHandler, Response } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { ApiErrorBody } from '../types';

interface MongoServerError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

/** 404 fallback for unmatched routes. */
export const notFoundHandler: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found.`, 'ROUTE_NOT_FOUND'));
};

/**
 * Central error handler. Normalises every failure (operational ApiErrors,
 * Mongoose validation/cast/duplicate-key errors and unexpected throwables) into
 * a single consistent JSON envelope with the correct HTTP status code.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    return next(err);
  }

  const normalized = normalizeError(err);
  const body: ApiErrorBody = {
    success: false,
    error: {
      message: normalized.message,
      code: normalized.code,
    },
  };
  if (normalized.details !== undefined) {
    body.error.details = normalized.details;
  }

  // Surface unexpected errors in non-production logs for debugging.
  if (normalized.statusCode >= 500 && !env.isTest) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  res.status(normalized.statusCode).json(body);
}

interface NormalizedError {
  statusCode: number;
  message: string;
  code?: string;
  details?: unknown;
}

function normalizeError(err: unknown): NormalizedError {
  if (err instanceof ApiError) {
    return { statusCode: err.statusCode, message: err.message, code: err.code, details: err.details };
  }

  // Mongoose schema validation failed.
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      path: e.path,
      message: e.message,
    }));
    return { statusCode: 400, message: 'Validation failed.', code: 'VALIDATION_ERROR', details };
  }

  // Invalid ObjectId / cast failure.
  if (err instanceof mongoose.Error.CastError) {
    return {
      statusCode: 400,
      message: `Invalid value for "${err.path}".`,
      code: 'CAST_ERROR',
    };
  }

  // Duplicate key (unique index) violation.
  const mongoErr = err as MongoServerError;
  if (mongoErr?.code === 11000) {
    const field = mongoErr.keyValue ? Object.keys(mongoErr.keyValue).join(', ') : 'field';
    return {
      statusCode: 409,
      message: `A record with this ${field} already exists.`,
      code: 'DUPLICATE_KEY',
      details: mongoErr.keyValue,
    };
  }

  if (err instanceof Error) {
    return { statusCode: 500, message: err.message || 'Internal server error.' };
  }

  return { statusCode: 500, message: 'Internal server error.' };
}
