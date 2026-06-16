import { z } from 'zod';

export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']);
export const TaskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: TaskPriorityEnum.default('MEDIUM'),
  deadline: z.string().datetime().optional(),
  departmentId: z.string().optional(),
  assigneeIds: z.array(z.string()).default([]),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: TaskStatusEnum.optional(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
