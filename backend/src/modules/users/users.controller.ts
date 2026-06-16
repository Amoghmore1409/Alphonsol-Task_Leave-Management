import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../../utils/api-response';
import * as usersService from './users.service';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { role, departmentId, isActive } = req.query;
    const filters: Record<string, unknown> = {};
    if (role) filters.role = role as string;
    if (departmentId) filters.departmentId = departmentId as string;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    const users = await usersService.listUsers(req.user!, filters);
    sendSuccess(res, users);
  } catch (err) { next(err); }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.createUser(req.body);
    sendSuccess(res, user, 201, 'User created');
  } catch (err) { next(err); }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUserById(req.user!.sub, req.user!);
    sendSuccess(res, user);
  } catch (err) { next(err); }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updateUser(req.user!.sub, req.body, req.user!);
    sendSuccess(res, user);
  } catch (err) { next(err); }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUserById(req.params.id, req.user!);
    sendSuccess(res, user);
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updateUser(req.params.id, req.body, req.user!);
    sendSuccess(res, user);
  } catch (err) { next(err); }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await usersService.deleteUser(req.params.id);
    sendSuccess(res, result, 200, 'User deactivated');
  } catch (err) { next(err); }
}

export async function getUserLeaveBalances(req: Request, res: Response, next: NextFunction) {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const balances = await usersService.getUserLeaveBalances(req.params.id, year);
    sendSuccess(res, balances);
  } catch (err) { next(err); }
}

export async function adjustLeaveBalance(req: Request, res: Response, next: NextFunction) {
  try {
    const { leaveType, year, adjustment } = req.body;
    const balance = await usersService.adjustLeaveBalance(req.params.id, leaveType, year, adjustment);
    sendSuccess(res, balance);
  } catch (err) { next(err); }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await usersService.changePassword(req.user!.sub, currentPassword, newPassword);
    sendSuccess(res, result);
  } catch (err) { next(err); }
}
