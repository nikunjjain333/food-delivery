import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  getNearbyStores,
  getStoreMenu,
  addSweetToStore,
  updateStoreSweetDetails,
  removeStoreSweet,
  getStoreInventory
} from '../controllers/storeController';

const router = express.Router();

// Public routes (for customers)
router.get('/nearby', getNearbyStores);
router.get('/all', getStores);
router.get('/:id', getStoreById);
router.get('/:id/menu', getStoreMenu);

// Protected routes (for merchants)
router.use(authenticateToken);

// Store management (merchants only)
router.post('/', createStore);
router.put('/:id', updateStore);
router.delete('/:id', deleteStore);

// Store inventory management
router.get('/:id/inventory', getStoreInventory);
router.post('/:id/sweets', addSweetToStore);
router.put('/:id/sweets/:sweetId', updateStoreSweetDetails);
router.delete('/:id/sweets/:sweetId', removeStoreSweet);

export default router;