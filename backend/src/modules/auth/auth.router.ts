import { Router } from 'express';
import { login, refresh, logout, logoutAll } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', authenticate, logoutAll);

export default router;
