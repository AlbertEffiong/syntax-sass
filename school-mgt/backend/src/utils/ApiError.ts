/**
 * Operational error type carrying an HTTP status code and optional machine
 * readable code / validation details. Thrown anywhere and translated to JSON by
 * the central error handler.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message = 'Bad request', code?: string, details?: unknown): ApiError {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message = 'Authentication required', code?: string): ApiError {
    return new ApiError(401, message, code ?? 'UNAUTHENTICATED');
  }

  static forbidden(message = 'You do not have permission to perform this action', code?: string): ApiError {
    return new ApiError(403, message, code ?? 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found', code?: string): ApiError {
    return new ApiError(404, message, code ?? 'NOT_FOUND');
  }

  static conflict(message = 'Resource already exists', code?: string): ApiError {
    return new ApiError(409, message, code ?? 'CONFLICT');
  }

  static internal(message = 'Internal server error', code?: string): ApiError {
    return new ApiError(500, message, code ?? 'INTERNAL_ERROR');
  }
}
