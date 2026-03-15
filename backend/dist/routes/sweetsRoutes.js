"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sweetsController_1 = require("../controllers/sweetsController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const validations_1 = require("../utils/validations");
const router = (0, express_1.Router)();
// Public / Customer endpoint
router.get('/', sweetsController_1.getSweets);
// Merchant only endpoints
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['ADMIN']), (0, validateRequest_1.validateRequest)(validations_1.sweetSchema), sweetsController_1.createSweet);
router.put('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['ADMIN']), (0, validateRequest_1.validateRequest)(validations_1.sweetSchema), sweetsController_1.updateSweet);
router.delete('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['ADMIN']), sweetsController_1.deleteSweet);
exports.default = router;
//# sourceMappingURL=sweetsRoutes.js.map