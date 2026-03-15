"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderSchema = exports.sweetSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        role: zod_1.z.enum(['CUSTOMER', 'ADMIN']).optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.sweetSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required'),
        description: zod_1.z.string().optional(),
        price: zod_1.z.number().positive('Price must be positive'),
        imageUrl: zod_1.z.string().url('Invalid image URL').optional().or(zod_1.z.literal('')),
        stock: zod_1.z.number().int().nonnegative().optional(),
        isAvailable: zod_1.z.boolean().optional(),
    }),
});
exports.orderSchema = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            quantity: zod_1.z.number().int().positive(),
        })).min(1, 'Order must have at least one item'),
        paymentMethod: zod_1.z.enum(['UPI', 'CARD', 'COD']),
    }),
});
//# sourceMappingURL=validations.js.map