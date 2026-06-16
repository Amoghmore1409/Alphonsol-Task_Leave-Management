import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, message = 'Success') {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendError(res: Response, message: string, statusCode = 400, details?: unknown) {
  return res.status(statusCode).json({ success: false, message, details });
}
