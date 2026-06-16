import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  departmentId: string | null;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
}
