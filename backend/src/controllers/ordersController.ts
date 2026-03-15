import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ApiResponse } from '../utils/ApiResponse';

export const createOrder = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return ApiResponse.error(res, 'Unauthorized', 401);
  }

  const { items, paymentMethod, deliveryAddress } = req.body;
  
  if (!items || items.length === 0) {
    return ApiResponse.error(res, 'Cart is empty', 400);
  }

  if (!deliveryAddress) {
    return ApiResponse.error(res, 'Delivery address is required', 400);
  }

  // Server-side calculation of total to avoid tampering
  let calculatedTotalAmount = 0;
  const orderItemsData = [];

  for (const item of items) {
    const sweet = await prisma.sweet.findUnique({ where: { id: item.id } });
    if (!sweet) return ApiResponse.error(res, `Sweet ${item.id} not found`, 400);
    
    const itemTotal = sweet.price * item.quantity;
    calculatedTotalAmount += itemTotal;

    orderItemsData.push({
      sweetId: sweet.id,
      quantity: item.quantity,
      price: sweet.price,
    });
  }

  // Add Delivery fee logic
  calculatedTotalAmount += 50;

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount: calculatedTotalAmount,
      paymentMethod,
      deliveryAddress,
      items: {
        create: orderItemsData
      }
    },
    include: { items: true }
  });

  return ApiResponse.success(res, order, 'Order placed successfully', 201);
};

export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { sweet: true } } },
    orderBy: { createdAt: 'desc' }
  });
  
  return ApiResponse.success(res, orders);
};

// Merchant specific endpoints
export const getAllOrders = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    include: { 
      user: { select: { name: true, email: true } }, 
      items: { include: { sweet: true } } 
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return ApiResponse.success(res, orders);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;

  const order = await prisma.order.update({
    where: { id },
    data: { status }
  });

  return ApiResponse.success(res, order, 'Order status updated');
};

export const submitReview = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { orderId, rating, comment } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { review: true }
    });

    if (!order) return ApiResponse.error(res, 'Order not found', 404);
    if (order.userId !== userId) return ApiResponse.error(res, 'Unauthorized', 401);
    if (order.status !== 'DELIVERED') return ApiResponse.error(res, 'Only delivered orders can be rated', 400);
    if (order.review) return ApiResponse.error(res, 'Order already rated', 400);

    const review = await prisma.review.create({
      data: {
        orderId,
        userId,
        rating,
        comment
      }
    });

    return ApiResponse.success(res, review, 'Review submitted successfully', 201);
  } catch (error) {
    console.error('Submit review error:', error);
    return ApiResponse.error(res, 'Failed to submit review', 500);
  }
};

export const getTopSellers = async (req: Request, res: Response) => {
  try {
    // Get top 5 sweets by total quantity sold
    const topSellers = await prisma.orderItem.groupBy({
      by: ['sweetId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // Fetch sweet details for these IDs
    const sweetDetails = await prisma.sweet.findMany({
      where: {
        id: { in: topSellers.map(s => s.sweetId) }
      }
    });

    // Merge calculations with details
    const result = topSellers.map(s => {
      const sweet = sweetDetails.find(sw => sw.id === s.sweetId);
      return {
        ...sweet,
        totalSold: s._sum.quantity
      };
    }).sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));

    return ApiResponse.success(res, result);
  } catch (error) {
    console.error('Get top sellers error:', error);
    return ApiResponse.error(res, 'Failed to fetch analytics', 500);
  }
};
