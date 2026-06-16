import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/api-response';
import * as departmentsService from './departments.service';

export async function listDepartments(req: Request, res: Response, next: NextFunction) {
  try {
    const departments = await departmentsService.listDepartments();
    sendSuccess(res, departments);
  } catch (err) { next(err); }
}

export async function createDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const dept = await departmentsService.createDepartment(req.body);
    sendSuccess(res, dept, 201, 'Department created');
  } catch (err) { next(err); }
}

export async function getDepartmentById(req: Request, res: Response, next: NextFunction) {
  try {
    const dept = await departmentsService.getDepartmentById(req.params.id);
    sendSuccess(res, dept);
  } catch (err) { next(err); }
}

export async function updateDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const dept = await departmentsService.updateDepartment(req.params.id, req.body);
    sendSuccess(res, dept);
  } catch (err) { next(err); }
}

export async function deleteDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    await departmentsService.deleteDepartment(req.params.id);
    sendSuccess(res, null, 200, 'Department deleted');
  } catch (err) { next(err); }
}

export async function getDepartmentMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const members = await departmentsService.getDepartmentMembers(req.params.id);
    sendSuccess(res, members);
  } catch (err) { next(err); }
}
