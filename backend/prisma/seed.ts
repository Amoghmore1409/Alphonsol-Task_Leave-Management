import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create departments (without manager first, set manager after users are created)
  const engineering = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: { name: 'Engineering', description: 'Software engineering and development' },
  });

  const hrDept = await prisma.department.upsert({
    where: { name: 'HR Department' },
    update: {},
    create: { name: 'HR Department', description: 'Human resources and people operations' },
  });

  const year = 2026;

  // Admin
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      passwordHash: adminHash,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // HR user
  const hrHash = await bcrypt.hash('Hr@123', 10);
  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@company.com' },
    update: {},
    create: {
      email: 'hr@company.com',
      passwordHash: hrHash,
      firstName: 'HR',
      lastName: 'Manager',
      role: 'HR',
      isActive: true,
      departmentId: hrDept.id,
      leaveBalances: {
        create: [
          { leaveType: 'ANNUAL', year, totalDays: 15 },
          { leaveType: 'SICK', year, totalDays: 10 },
          { leaveType: 'CASUAL', year, totalDays: 5 },
        ],
      },
    },
  });

  // Manager
  const managerHash = await bcrypt.hash('Manager@123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@company.com' },
    update: {},
    create: {
      email: 'manager@company.com',
      passwordHash: managerHash,
      firstName: 'Engineering',
      lastName: 'Manager',
      role: 'MANAGER',
      isActive: true,
      departmentId: engineering.id,
      leaveBalances: {
        create: [
          { leaveType: 'ANNUAL', year, totalDays: 15 },
          { leaveType: 'SICK', year, totalDays: 10 },
          { leaveType: 'CASUAL', year, totalDays: 5 },
        ],
      },
    },
  });

  // Set Engineering manager
  await prisma.department.update({
    where: { id: engineering.id },
    data: { managerId: manager.id },
  });

  // Employees (shared hash)
  const empHash = await bcrypt.hash('Employee@123', 10);

  const emp1 = await prisma.user.upsert({
    where: { email: 'emp1@company.com' },
    update: {},
    create: {
      email: 'emp1@company.com',
      passwordHash: empHash,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: 'EMPLOYEE',
      isActive: true,
      departmentId: engineering.id,
      leaveBalances: {
        create: [
          { leaveType: 'ANNUAL', year, totalDays: 15 },
          { leaveType: 'SICK', year, totalDays: 10 },
          { leaveType: 'CASUAL', year, totalDays: 5 },
        ],
      },
    },
  });

  const emp2 = await prisma.user.upsert({
    where: { email: 'emp2@company.com' },
    update: {},
    create: {
      email: 'emp2@company.com',
      passwordHash: empHash,
      firstName: 'Bob',
      lastName: 'Smith',
      role: 'EMPLOYEE',
      isActive: true,
      departmentId: engineering.id,
      leaveBalances: {
        create: [
          { leaveType: 'ANNUAL', year, totalDays: 15 },
          { leaveType: 'SICK', year, totalDays: 10 },
          { leaveType: 'CASUAL', year, totalDays: 5 },
        ],
      },
    },
  });

  const emp3 = await prisma.user.upsert({
    where: { email: 'emp3@company.com' },
    update: {},
    create: {
      email: 'emp3@company.com',
      passwordHash: empHash,
      firstName: 'Carol',
      lastName: 'Williams',
      role: 'EMPLOYEE',
      isActive: true,
      departmentId: engineering.id,
      leaveBalances: {
        create: [
          { leaveType: 'ANNUAL', year, totalDays: 15 },
          { leaveType: 'SICK', year, totalDays: 10 },
          { leaveType: 'CASUAL', year, totalDays: 5 },
        ],
      },
    },
  });

  console.log('Seed complete:');
  console.log('  Departments:', engineering.name, ',', hrDept.name);
  console.log('  Admin:', admin.email);
  console.log('  HR:', hrUser.email);
  console.log('  Manager:', manager.email);
  console.log('  Employees:', emp1.email, ',', emp2.email, ',', emp3.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
