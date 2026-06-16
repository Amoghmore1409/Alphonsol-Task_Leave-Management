import { z } from 'zod';

export const LeaveTypeEnum = z.enum(['ANNUAL', 'SICK', 'CASUAL']);
export const LeaveStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);

export const createLeaveRequestSchema = z.object({
  leaveType: LeaveTypeEnum,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().min(10),
  attachmentUrl: z.string().url().optional(),
});

export const reviewLeaveSchema = z.object({
  comment: z.string().optional(),
});

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;
