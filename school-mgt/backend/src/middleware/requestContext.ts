import crypto from 'crypto';
import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Assigns a correlation id to every request (honouring an inbound
 * `x-request-id`) and echoes it back on the response. The id is used in error
 * logs so a failing request can be traced end-to-end.
 */
export const requestContext: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const incoming = req.headers['x-request-id'];
  const id = (Array.isArray(incoming) ? incoming[0] : incoming) || crypto.randomUUID();
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
};

/**
 * Minimal structured request logger (no external dependency). Skips the noisy
 * health probes.
 */
export const requestLogger: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health' || req.path === '/ready') {
    return next();
  }
  const startedAt = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - startedAt;
    // eslint-disable-next-line no-console
    console.log(
      `[req] ${req.id} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`,
    );
  });
  return next();
};
