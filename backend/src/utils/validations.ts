import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['CUSTOMER', 'ADMIN']).optional(),
    address: z.string().min(5, 'Address is too short').optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const sweetSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
    stock: z.number().int().nonnegative().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const orderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      id: z.string(),
      quantity: z.number().int().positive(),
    })).min(1, 'Order must have at least one item'),
    paymentMethod: z.enum(['UPI', 'CARD', 'COD']),
    deliveryAddress: z.string().min(5, 'Delivery address is too short'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    address: z.string().min(5, 'Address is too short').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export const reviewSchema = z.object({
  body: z.object({
    orderId: z.string().uuid('Invalid order ID'),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});
