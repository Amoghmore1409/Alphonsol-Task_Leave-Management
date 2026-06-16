import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const engineering = await prisma.department.upsert({
    where: { name: 'Engineering' },
    create: { name: 'Engineering', description: 'Software development team' },
    update: {},
  });

  const hrDept = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    create: { name: 'Human Resources', description: 'HR team' },
    update: {},
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@alphonsol.com' },
    create: { email: 'admin@alphonsol.com', passwordHash, firstName: 'Alice', lastName: 'Admin', role: 'ADMIN' },
    update: {},
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@alphonsol.com' },
    create: { email: 'manager@alphonsol.com', passwordHash, firstName: 'Mark', lastName: 'Manager', role: 'MANAGER', departmentId: engineering.id },
    update: {},
  });

  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@alphonsol.com' },
    create: { email: 'hr@alphonsol.com', passwordHash, firstName: 'Hannah', lastName: 'HR', role: 'HR', departmentId: hrDept.id },
    update: {},
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@alphonsol.com' },
    create: { email: 'employee@alphonsol.com', passwordHash, firstName: 'Eve', lastName: 'Employee', role: 'EMPLOYEE', departmentId: engineering.id },
    update: {},
  });

  await prisma.department.update({ where: { id: engineering.id }, data: { managerId: manager.id } });
  await prisma.department.update({ where: { id: hrDept.id }, data: { managerId: hrUser.id } });

  const year = new Date().getFullYear();
  const leaveAllocations: Array<['ANNUAL' | 'SICK' | 'CASUAL', number]> = [['ANNUAL', 20], ['SICK', 10], ['CASUAL', 5]];
  for (const user of [admin, manager, hrUser, employee]) {
    for (const [leaveType, totalDays] of leaveAllocations) {
      await prisma.leaveBalance.upsert({
        where: { userId_leaveType_year: { userId: user.id, leaveType, year } },
        create: { userId: user.id, leaveType, year, totalDays },
        update: {},
      });
    }
  }

  console.log('Seed complete:', { admin: admin.email, manager: manager.email, hr: hrUser.email, employee: employee.email });
}

main().catch(console.error).finally(() => prisma.$disconnect());
