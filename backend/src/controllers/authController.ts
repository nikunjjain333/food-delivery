import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { ApiResponse } from '../utils/ApiResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'rohit_sweets_super_secret_key';

export const register = async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return ApiResponse.error(res, 'User already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role || 'CUSTOMER',
      address: req.body.address || null,
    },
    select: { id: true, email: true, name: true, role: true, address: true }
  });

  return ApiResponse.success(res, { user }, 'User registered successfully', 201);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return ApiResponse.error(res, 'Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return ApiResponse.error(res, 'Invalid credentials', 401);
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  return ApiResponse.success(res, {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      address: user.address
    }
  }, 'Login successful');
};

export const updateProfile = async (req: any, res: Response) => {
  const { name, email } = req.body;
  const userId = req.userId;

  try {
    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (existingUser) {
        return ApiResponse.error(res, 'Email already in use', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...('address' in req.body && { address: req.body.address })
      },
      select: { id: true, email: true, name: true, role: true, address: true }
    });

    return ApiResponse.success(res, { user: updatedUser }, 'Profile updated successfully');
  } catch (error) {
    console.error('Profile update error:', error);
    return ApiResponse.error(res, 'Failed to update profile', 500);
  }
};

export const changePassword = async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return ApiResponse.error(res, 'Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return ApiResponse.success(res, {}, 'Password changed successfully');
  } catch (error) {
    console.error('Password change error:', error);
    return ApiResponse.error(res, 'Failed to change password', 500);
  }
};

export const getProfileStats = async (req: any, res: Response) => {
  const userId = req.userId;

  try {
    const orders = await prisma.order.findMany({
      where: { userId, status: { not: 'CANCELLED' } },
      select: { totalAmount: true }
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((acc, current) => acc + current.totalAmount, 0);

    return ApiResponse.success(res, {
      totalOrders,
      totalSpent
    });
  } catch (error) {
    console.error('Profile stats error:', error);
    return ApiResponse.error(res, 'Failed to fetch profile stats', 500);
  }
};
