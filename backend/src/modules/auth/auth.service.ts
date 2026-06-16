import { addDays } from 'date-fns';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { generateRefreshToken, hashRefreshToken, verifyPassword } from '../../utils/hash.utils';
import { signAccessToken } from '../../utils/jwt.utils';

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new Error('Invalid credentials');

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const rawRefreshToken = generateRefreshToken();
  const hashedToken = hashRefreshToken(rawRefreshToken);
  const expiresAt = addDays(new Date(), parseInt(env.REFRESH_TOKEN_EXPIRES_DAYS));

  await prisma.refreshToken.create({
    data: { token: hashedToken, userId: user.id, expiresAt },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      departmentId: user.departmentId,
      avatarUrl: user.avatarUrl,
    },
  };
}

export async function refreshTokens(rawToken: string) {
  const hashedToken = hashRefreshToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { token: hashedToken } });

  if (!stored) throw new Error('Invalid refresh token');

  if (stored.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId },
      data: { revokedAt: new Date() },
    });
    throw new Error('Refresh token reuse detected');
  }

  if (stored.expiresAt < new Date()) throw new Error('Refresh token expired');

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: stored.userId } });

  const newRawToken = generateRefreshToken();
  const newHashedToken = hashRefreshToken(newRawToken);
  const expiresAt = addDays(new Date(), parseInt(env.REFRESH_TOKEN_EXPIRES_DAYS));

  await prisma.refreshToken.create({
    data: { token: newHashedToken, userId: user.id, expiresAt },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
  });

  return { accessToken, refreshToken: newRawToken };
}

export async function revokeRefreshToken(rawToken: string) {
  const hashedToken = hashRefreshToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { token: hashedToken, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllUserTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
