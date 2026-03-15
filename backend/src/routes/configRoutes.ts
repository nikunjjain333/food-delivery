import { Router } from 'express';
import { getConfigs, updateConfig } from '../controllers/configController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Public / Customer endpoint
router.get('/', getConfigs);

// Merchant endpoint
router.put('/:key', authenticate, requireRole(['ADMIN']), updateConfig);

export default router;
