import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as departmentsController from './departments.controller';

const router = Router();

router.use(authenticate);

router.get('/', departmentsController.listDepartments);
router.post('/', requireRole('ADMIN'), departmentsController.createDepartment);
router.get('/:id', departmentsController.getDepartmentById);
router.put('/:id', requireRole('ADMIN'), departmentsController.updateDepartment);
router.delete('/:id', requireRole('ADMIN'), departmentsController.deleteDepartment);
router.get('/:id/members', requireRole('ADMIN', 'HR', 'MANAGER'), departmentsController.getDepartmentMembers);

export default router;
