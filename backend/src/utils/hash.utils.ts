import crypto from 'crypto';
import bcrypt from 'bcrypt';

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
