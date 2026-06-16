import { z } from 'zod';

export const RoleEnum = z.enum(['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE']);
export type Role = z.infer<typeof RoleEnum>;

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: RoleEnum.default('EMPLOYEE'),
  departmentId: z.string().optional(),
  phone: z.string().optional(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
