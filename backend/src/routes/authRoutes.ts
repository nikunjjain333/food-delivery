import { Router } from 'express';
import { register, login, updateProfile, changePassword, getProfileStats } from '../controllers/authController';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../utils/validations';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), updateProfile);
router.put('/change-password', authenticate, validateRequest(changePasswordSchema), changePassword);
router.get('/stats', authenticate, getProfileStats);

export default router;
