import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt.utils';
import { sendError } from '../utils/api-response';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'No token provided', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}
