import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as usersController from './users.controller';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'HR'), usersController.listUsers);
router.post('/', requireRole('ADMIN', 'HR'), usersController.createUser);
router.get('/me', usersController.getMe);
router.put('/me', usersController.updateMe);
router.put('/me/password', usersController.changePassword);
router.get('/:id', usersController.getUserById);
router.put('/:id', requireRole('ADMIN', 'HR'), usersController.updateUser);
router.delete('/:id', requireRole('ADMIN'), usersController.deleteUser);
router.get('/:id/leave-balances', usersController.getUserLeaveBalances);
router.put('/:id/leave-balances', requireRole('ADMIN', 'HR'), usersController.adjustLeaveBalance);

export default router;
