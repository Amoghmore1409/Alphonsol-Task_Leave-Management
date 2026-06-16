import { prisma } from '../../config/prisma';

export async function listDepartments() {
  return prisma.department.findMany({
    include: {
      manager: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: { select: { employees: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createDepartment(data: { name: string; description?: string; managerId?: string }) {
  return prisma.department.create({
    data: { name: data.name, description: data.description || null, managerId: data.managerId || null },
    include: { manager: { select: { id: true, firstName: true, lastName: true } } },
  });
}

export async function getDepartmentById(id: string) {
  return prisma.department.findUniqueOrThrow({
    where: { id },
    include: {
      manager: { select: { id: true, firstName: true, lastName: true, email: true } },
      employees: { select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true, avatarUrl: true }, where: { isActive: true } },
      _count: { select: { employees: true } },
    },
  });
}

export async function updateDepartment(id: string, data: { name?: string; description?: string; managerId?: string }) {
  return prisma.department.update({
    where: { id },
    data: { name: data.name, description: data.description, managerId: data.managerId || null },
    include: { manager: { select: { id: true, firstName: true, lastName: true } } },
  });
}

export async function deleteDepartment(id: string) {
  const activeUsers = await prisma.user.count({ where: { departmentId: id, isActive: true } });
  if (activeUsers > 0) throw Object.assign(new Error('Cannot delete department with active members'), { statusCode: 400 });
  return prisma.department.delete({ where: { id } });
}

export async function getDepartmentMembers(id: string) {
  return prisma.user.findMany({
    where: { departmentId: id },
    select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true, avatarUrl: true, joinedAt: true },
    orderBy: { firstName: 'asc' },
  });
}
