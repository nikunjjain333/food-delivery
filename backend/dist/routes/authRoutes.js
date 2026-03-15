"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validateRequest_1 = require("../middlewares/validateRequest");
const validations_1 = require("../utils/validations");
const router = (0, express_1.Router)();
router.post('/register', (0, validateRequest_1.validateRequest)(validations_1.registerSchema), authController_1.register);
router.post('/login', (0, validateRequest_1.validateRequest)(validations_1.loginSchema), authController_1.login);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map