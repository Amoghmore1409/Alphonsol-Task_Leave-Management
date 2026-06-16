import { prisma } from '../../config/prisma';
import { hashPassword, verifyPassword } from '../../utils/hash.utils';
import { AccessTokenPayload } from '../../utils/jwt.utils';

export async function listUsers(requestingUser: AccessTokenPayload, filters: { role?: string; departmentId?: string; isActive?: boolean }) {
  const where: Record<string, unknown> = { ...filters };
  // Admin/HR see all; Manager sees own department only
  if (requestingUser.role === 'MANAGER') {
    where.departmentId = requestingUser.departmentId;
  }
  return prisma.user.findMany({
    where,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, avatarUrl: true, phone: true, joinedAt: true, departmentId: true, department: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createUser(data: { email: string; password: string; firstName: string; lastName: string; role?: string; departmentId?: string; phone?: string }) {
  const passwordHash = await hashPassword(data.password);
  const year = new Date().getFullYear();
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: (data.role as any) || 'EMPLOYEE',
      departmentId: data.departmentId || null,
      phone: data.phone || null,
      leaveBalances: {
        create: [
          { leaveType: 'ANNUAL', year, totalDays: 15 },
          { leaveType: 'SICK', year, totalDays: 10 },
          { leaveType: 'CASUAL', year, totalDays: 5 },
        ],
      },
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, departmentId: true, joinedAt: true },
  });
  return user;
}

export async function getUserById(id: string, requestingUser: AccessTokenPayload) {
  if (requestingUser.role === 'EMPLOYEE' && requestingUser.sub !== id) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }
  if (requestingUser.role === 'MANAGER') {
    const user = await prisma.user.findUnique({ where: { id }, select: { departmentId: true } });
    if (!user || user.departmentId !== requestingUser.departmentId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
  }
  return prisma.user.findUniqueOrThrow({
    where: { id },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, avatarUrl: true, phone: true, joinedAt: true, createdAt: true, departmentId: true, department: { select: { id: true, name: true } } },
  });
}

export async function updateUser(id: string, data: Record<string, unknown>, requestingUser: AccessTokenPayload) {
  // Admin/HR can update role/department/isActive; any user can update own firstName/lastName/phone/avatarUrl
  const allowedFields: Record<string, unknown> = {};
  if (requestingUser.role === 'ADMIN' || requestingUser.role === 'HR') {
    const { role, departmentId, isActive, firstName, lastName, phone, avatarUrl } = data as any;
    if (role !== undefined) allowedFields.role = role;
    if (departmentId !== undefined) allowedFields.departmentId = departmentId;
    if (isActive !== undefined) allowedFields.isActive = isActive;
    if (firstName !== undefined) allowedFields.firstName = firstName;
    if (lastName !== undefined) allowedFields.lastName = lastName;
    if (phone !== undefined) allowedFields.phone = phone;
    if (avatarUrl !== undefined) allowedFields.avatarUrl = avatarUrl;
  } else {
    const { firstName, lastName, phone, avatarUrl } = data as any;
    if (firstName !== undefined) allowedFields.firstName = firstName;
    if (lastName !== undefined) allowedFields.lastName = lastName;
    if (phone !== undefined) allowedFields.phone = phone;
    if (avatarUrl !== undefined) allowedFields.avatarUrl = avatarUrl;
  }
  return prisma.user.update({
    where: { id },
    data: allowedFields as any,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, avatarUrl: true, phone: true, departmentId: true },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.update({ where: { id }, data: { isActive: false }, select: { id: true, isActive: true } });
}

export async function getUserLeaveBalances(userId: string, year: number) {
  return prisma.leaveBalance.findMany({ where: { userId, year }, orderBy: { leaveType: 'asc' } });
}

export async function adjustLeaveBalance(userId: string, leaveType: string, year: number, adjustment: number) {
  return prisma.leaveBalance.update({
    where: { userId_leaveType_year: { userId, leaveType: leaveType as any, year } },
    data: { totalDays: { increment: adjustment } },
  });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { passwordHash: true } });
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
  const newHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
  return { message: 'Password changed successfully' };
}
