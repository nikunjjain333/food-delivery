"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ordersController_1 = require("../controllers/ordersController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const validations_1 = require("../utils/validations");
const router = (0, express_1.Router)();
// Customer endpoints
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['CUSTOMER', 'ADMIN']), (0, validateRequest_1.validateRequest)(validations_1.orderSchema), ordersController_1.createOrder);
router.get('/my-orders', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['CUSTOMER', 'ADMIN']), ordersController_1.getCustomerOrders);
// Merchant endpoints
router.get('/all', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['ADMIN']), ordersController_1.getAllOrders);
router.put('/:id/status', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['ADMIN']), ordersController_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=ordersRoutes.js.map