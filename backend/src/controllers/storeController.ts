import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createStoreSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  deliveryRadius: z.number().positive().optional(),
  operatingHours: z.object({}).optional(),
});

const updateStoreSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isActive: z.boolean().optional(),
  deliveryRadius: z.number().positive().optional(),
  operatingHours: z.object({}).optional(),
});

const storeSweetSchema = z.object({
  sweetId: z.string(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
});

const updateStoreSweetSchema = z.object({
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Create a new store (merchant only)
export const createStore = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Check if user is merchant
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Merchant access required' });
    }

    const validatedData = createStoreSchema.parse(req.body);

    const store = await prisma.store.create({
      data: {
        ...validatedData,
        merchantId: userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: store,
    });
  } catch (error: any) {
    console.error('Create store error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create store',
    });
  }
};

// Get stores (with filtering for merchant)
export const getStores = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { merchantOnly } = req.query;

    let whereClause: any = { isActive: true };

    // If authenticated merchant and wants their stores only
    if (userId && merchantOnly === 'true') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role === 'ADMIN') {
        whereClause.merchantId = userId;
      }
    }

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        merchant: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            storeSweets: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: stores,
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores',
    });
  }
};

// Get nearby stores based on location
export const getNearbyStores = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const searchRadius = parseFloat(radius as string);

    const stores = await prisma.store.findMany({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        merchant: {
          select: { id: true, name: true },
        },
        _count: {
          select: { storeSweets: true },
        },
      },
    });

    // Filter by distance and add distance field
    const nearbyStores = stores
      .map(store => {
        if (store.latitude && store.longitude) {
          const distance = calculateDistance(lat, lon, store.latitude, store.longitude);
          return { ...store, distance };
        }
        return null;
      })
      .filter(store => store !== null && store.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: nearbyStores,
    });
  } catch (error) {
    console.error('Get nearby stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby stores',
    });
  }
};

// Get store by ID
export const getStoreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        merchant: {
          select: { id: true, name: true, email: true },
        },
        storeSweets: {
          include: {
            sweet: true,
          },
          where: { isAvailable: true },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error('Get store by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store',
    });
  }
};

// Get store menu (available sweets with store-specific pricing)
export const getStoreMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id, isActive: true },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    const menu = await prisma.storeSweets.findMany({
      where: {
        storeId: id,
        isAvailable: true,
        stock: { gt: 0 },
      },
      include: {
        sweet: true,
      },
      orderBy: {
        sweet: { name: 'asc' },
      },
    });

    // Transform to include store-specific pricing
    const menuItems = menu.map(item => ({
      ...item.sweet,
      storePrice: item.price || item.sweet.price,
      storeStock: item.stock,
      storeSweetId: item.id,
    }));

    res.json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          address: store.address,
          operatingHours: store.operatingHours,
        },
        menu: menuItems,
      },
    });
  } catch (error) {
    console.error('Get store menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store menu',
    });
  }
};

// Update store (merchant only)
export const updateStore = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Check if store belongs to merchant
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    if (store.merchantId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const validatedData = updateStoreSchema.parse(req.body);

    const updatedStore = await prisma.store.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      message: 'Store updated successfully',
      data: updatedStore,
    });
  } catch (error: any) {
    console.error('Update store error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update store',
    });
  }
};

// Delete store (merchant only)
export const deleteStore = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Check if store belongs to merchant
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    if (store.merchantId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if store has pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        storeId: id,
        status: { in: ['PENDING', 'ACCEPTED', 'DISPATCHED'] },
      },
    });

    if (pendingOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete store with pending orders',
      });
    }

    await prisma.store.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Store deleted successfully',
    });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete store',
    });
  }
};

// Get store inventory (merchant only)
export const getStoreInventory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Check if store belongs to merchant
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store || store.merchantId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const inventory = await prisma.storeSweets.findMany({
      where: { storeId: id },
      include: {
        sweet: true,
      },
      orderBy: {
        sweet: { name: 'asc' },
      },
    });

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error('Get store inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store inventory',
    });
  }
};

// Add sweet to store (merchant only)
export const addSweetToStore = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Check if store belongs to merchant
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store || store.merchantId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const validatedData = storeSweetSchema.parse(req.body);

    // Check if sweet exists
    const sweet = await prisma.sweet.findUnique({
      where: { id: validatedData.sweetId },
    });

    if (!sweet) {
      return res.status(404).json({ success: false, message: 'Sweet not found' });
    }

    // Check if already exists
    const existing = await prisma.storeSweets.findUnique({
      where: {
        storeId_sweetId: {
          storeId: id,
          sweetId: validatedData.sweetId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Sweet already exists in store' });
    }

    const storeSweet = await prisma.storeSweets.create({
      data: {
        storeId: id,
        sweetId: validatedData.sweetId,
        price: validatedData.price,
        stock: validatedData.stock || 0,
        isAvailable: validatedData.isAvailable !== undefined ? validatedData.isAvailable : true,
      },
      include: {
        sweet: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Sweet added to store successfully',
      data: storeSweet,
    });
  } catch (error: any) {
    console.error('Add sweet to store error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to add sweet to store',
    });
  }
};

// Update store sweet details (merchant only)
export const updateStoreSweetDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id, sweetId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Check if store belongs to merchant
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store || store.merchantId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const validatedData = updateStoreSweetSchema.parse(req.body);

    const storeSweet = await prisma.storeSweets.update({
      where: {
        storeId_sweetId: {
          storeId: id,
          sweetId: sweetId,
        },
      },
      data: validatedData,
      include: {
        sweet: true,
      },
    });

    res.json({
      success: true,
      message: 'Store sweet updated successfully',
      data: storeSweet,
    });
  } catch (error: any) {
    console.error('Update store sweet error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update store sweet',
    });
  }
};

// Remove sweet from store (merchant only)
export const removeStoreSweet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id, sweetId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Check if store belongs to merchant
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store || store.merchantId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await prisma.storeSweets.delete({
      where: {
        storeId_sweetId: {
          storeId: id,
          sweetId: sweetId,
        },
      },
    });

    res.json({
      success: true,
      message: 'Sweet removed from store successfully',
    });
  } catch (error) {
    console.error('Remove store sweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove sweet from store',
    });
  }
};