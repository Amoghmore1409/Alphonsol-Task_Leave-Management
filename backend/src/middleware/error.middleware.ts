import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/api-response';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    sendError(res, 'Validation error', 400, err.errors);
    return;
  }
  console.error(err);
  sendError(res, err.message || 'Internal server error', 500);
}
