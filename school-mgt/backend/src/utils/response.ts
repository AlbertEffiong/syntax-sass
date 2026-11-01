import { Response } from 'express';
import { ApiSuccess } from '../types';

/**
 * Sends a consistent `200 OK` success envelope.
 */
export function ok<T>(res: Response, data: T, message?: string): Response {
  const body: ApiSuccess<T> = { success: true, data };
  if (message) body.message = message;
  return res.status(200).json(body);
}

/**
 * Sends a consistent `201 Created` success envelope.
 */
export function created<T>(res: Response, data: T, message?: string): Response {
  const body: ApiSuccess<T> = { success: true, data };
  if (message) body.message = message;
  return res.status(201).json(body);
}
