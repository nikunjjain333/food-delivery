import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiResponse } from '../utils/ApiResponse';

export const getSweets = async (req: Request, res: Response) => {
  const { all, storeId } = req.query;

  // If storeId is provided, get store-specific sweets
  if (storeId) {
    const storeSweets = await prisma.storeSweets.findMany({
      where: {
        storeId: storeId as string,
        isAvailable: all === 'true' ? undefined : true,
        stock: all === 'true' ? undefined : { gt: 0 },
      },
      include: {
        sweet: true,
      },
      orderBy: {
        sweet: { name: 'asc' },
      },
    });

    // Transform to include store-specific pricing
    const sweetsWithStorePrice = storeSweets.map(storeSweet => ({
      ...storeSweet.sweet,
      storePrice: storeSweet.price || storeSweet.sweet.price,
      storeStock: storeSweet.stock,
      storeAvailable: storeSweet.isAvailable,
      storeSweetId: storeSweet.id,
    }));

    return ApiResponse.success(res, sweetsWithStorePrice);
  }

  // Default behavior - get all base sweets
  const condition = all === 'true' ? {} : { isAvailable: true };
  const sweets = await prisma.sweet.findMany({
    where: condition,
    orderBy: { name: 'asc' },
  });

  return ApiResponse.success(res, sweets);
};

export const createSweet = async (req: Request, res: Response) => {
  const { name, description, price, imageUrl, stock, isAvailable } = req.body;
  
  const sweet = await prisma.sweet.create({
    data: { name, description, price, imageUrl, stock, isAvailable }
  });
  
  return ApiResponse.success(res, sweet, 'Sweet added to inventory', 201);
};

export const updateSweet = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name, description, price, imageUrl, stock, isAvailable } = req.body;

  const sweet = await prisma.sweet.update({
    where: { id },
    data: { name, description, price, imageUrl, stock, isAvailable }
  });

  return ApiResponse.success(res, sweet, 'Sweet updated');
};

export const deleteSweet = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await prisma.sweet.delete({ where: { id } });
  
  return ApiResponse.success(res, null, 'Sweet removed from inventory');
};
