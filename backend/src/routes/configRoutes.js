"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const configController_1 = require("../controllers/configController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Public / Customer endpoint
router.get('/', configController_1.getConfigs);
// Merchant endpoint
router.put('/:key', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['ADMIN']), configController_1.updateConfig);
exports.default = router;
//# sourceMappingURL=configRoutes.js.map