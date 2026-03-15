"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const ApiResponse_1 = require("../utils/ApiResponse");
const JWT_SECRET = process.env.JWT_SECRET || 'rohit_sweets_super_secret_key';
const register = async (req, res) => {
    const { email, password, name, role } = req.body;
    // Check if user exists
    const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return ApiResponse_1.ApiResponse.error(res, 'User already exists', 400);
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await db_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: role || 'CUSTOMER',
        },
        select: { id: true, email: true, name: true, role: true }
    });
    return ApiResponse_1.ApiResponse.success(res, { user }, 'User registered successfully', 201);
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return ApiResponse_1.ApiResponse.error(res, 'Invalid credentials', 401);
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        return ApiResponse_1.ApiResponse.error(res, 'Invalid credentials', 401);
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return ApiResponse_1.ApiResponse.success(res, {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    }, 'Login successful');
};
exports.login = login;
//# sourceMappingURL=authController.js.map