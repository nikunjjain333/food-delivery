import { Router } from 'express';
import { getSweets, createSweet, updateSweet, deleteSweet } from '../controllers/sweetsController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { sweetSchema } from '../utils/validations';

const router = Router();

// Public / Customer endpoint
router.get('/', getSweets);

// Merchant only endpoints
router.post('/', authenticate, requireRole(['ADMIN']), validateRequest(sweetSchema), createSweet);
router.put('/:id', authenticate, requireRole(['ADMIN']), validateRequest(sweetSchema), updateSweet);
router.delete('/:id', authenticate, requireRole(['ADMIN']), deleteSweet);

export default router;
