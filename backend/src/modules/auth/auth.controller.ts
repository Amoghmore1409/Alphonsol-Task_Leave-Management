import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '@alphonsol/shared';
import { sendSuccess, sendError } from '../../utils/api-response';
import * as authService from './auth.service';
import { env } from '../../config/env';

const COOKIE_NAME = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: parseInt(env.REFRESH_TOKEN_EXPIRES_DAYS) * 24 * 60 * 60 * 1000,
};

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.loginUser(email, password);
    res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);
    sendSuccess(res, { accessToken: result.accessToken, user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken = req.cookies?.[COOKIE_NAME];
    if (!rawToken) {
      sendError(res, 'No refresh token', 401);
      return;
    }
    const result = await authService.refreshTokens(rawToken);
    res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);
    sendSuccess(res, { accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken = req.cookies?.[COOKIE_NAME];
    if (rawToken) await authService.revokeRefreshToken(rawToken);
    res.clearCookie(COOKIE_NAME);
    sendSuccess(res, null, 200, 'Logged out');
  } catch (err) {
    next(err);
  }
}

export async function logoutAll(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    await authService.revokeAllUserTokens(req.user.sub);
    res.clearCookie(COOKIE_NAME);
    sendSuccess(res, null, 200, 'All sessions revoked');
  } catch (err) {
    next(err);
  }
}
