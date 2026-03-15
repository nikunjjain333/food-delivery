import { Router } from 'express';
import { createOrder, getCustomerOrders, getAllOrders, updateOrderStatus, submitReview, getTopSellers } from '../controllers/ordersController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { orderSchema, reviewSchema } from '../utils/validations';

const router = Router();

// Customer endpoints
router.post('/', authenticate, requireRole(['CUSTOMER', 'ADMIN']), validateRequest(orderSchema), createOrder);
router.get('/my-orders', authenticate, requireRole(['CUSTOMER', 'ADMIN']), getCustomerOrders);
router.post('/rate', authenticate, requireRole(['CUSTOMER']), validateRequest(reviewSchema), submitReview);

// Merchant endpoints
router.get('/all', authenticate, requireRole(['ADMIN']), getAllOrders);
router.put('/:id/status', authenticate, requireRole(['ADMIN']), updateOrderStatus);
router.get('/top-sellers', authenticate, getTopSellers);

export default router;
