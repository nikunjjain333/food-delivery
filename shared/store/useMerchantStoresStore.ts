import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';
import { Store } from './useStoresStore';

export interface StoreSweet {
  id: string;
  storeId: string;
  sweetId: string;
  price?: number;
  stock: number;
  isAvailable: boolean;
  sweet: {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    category?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreData {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  deliveryRadius?: number;
  operatingHours?: any;
}

export interface UpdateStoreData {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  deliveryRadius?: number;
  operatingHours?: any;
}

export interface StoreSweetData {
  sweetId: string;
  price?: number;
  stock?: number;
  isAvailable?: boolean;
}

export interface UpdateStoreSweetData {
  price?: number;
  stock?: number;
  isAvailable?: boolean;
}

interface MerchantStoresState {
  // Store management
  selectedStoreId: string | null;
  merchantStores: Store[];
  currentStore: Store | null;
  loading: boolean;
  error: string | null;

  // Store inventory
  storeInventory: StoreSweet[];
  inventoryLoading: boolean;

  // Actions
  setSelectedStoreId: (storeId: string | null) => void;
  fetchMerchantStores: () => Promise<void>;
  createStore: (storeData: CreateStoreData) => Promise<Store | null>;
  updateStore: (storeId: string, storeData: UpdateStoreData) => Promise<Store | null>;
  deleteStore: (storeId: string) => Promise<boolean>;

  // Store inventory management
  fetchStoreInventory: (storeId: string) => Promise<void>;
  addSweetToStore: (storeId: string, sweetData: StoreSweetData) => Promise<StoreSweet | null>;
  updateStoreSweet: (storeId: string, sweetId: string, sweetData: UpdateStoreSweetData) => Promise<StoreSweet | null>;
  removeStoreSweet: (storeId: string, sweetId: string) => Promise<boolean>;

  clearStoreData: () => void;
}

export const useMerchantStoresStore = create<MerchantStoresState>()(
  persist(
    (set, get) => ({
      selectedStoreId: null,
      merchantStores: [],
      currentStore: null,
      loading: false,
      error: null,
      storeInventory: [],
      inventoryLoading: false,

      setSelectedStoreId: (storeId) => {
        set({ selectedStoreId: storeId });
        // Find and set current store
        const { merchantStores } = get();
        const currentStore = merchantStores.find(store => store.id === storeId) || null;
        set({ currentStore });

        // Clear inventory when switching stores
        if (storeId !== get().selectedStoreId) {
          set({ storeInventory: [] });
        }
      },

      fetchMerchantStores: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/stores/all?merchantOnly=true');
          if (response.data.success) {
            const stores = response.data.data;
            set({ merchantStores: stores, loading: false });

            // If no store selected and stores exist, select first one
            const { selectedStoreId } = get();
            if (!selectedStoreId && stores.length > 0) {
              get().setSelectedStoreId(stores[0].id);
            }
          } else {
            set({ error: 'Failed to fetch stores', loading: false });
          }
        } catch (error: any) {
          console.error('Fetch merchant stores error:', error);
          set({
            error: error.response?.data?.message || 'Failed to fetch stores',
            loading: false
          });
        }
      },

      createStore: async (storeData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/stores', storeData);
          if (response.data.success) {
            const newStore = response.data.data;
            set((state) => ({
              merchantStores: [...state.merchantStores, newStore],
              loading: false
            }));

            // If it's the first store, select it
            const { merchantStores } = get();
            if (merchantStores.length === 1) {
              get().setSelectedStoreId(newStore.id);
            }

            return newStore;
          } else {
            set({ error: response.data.message || 'Failed to create store', loading: false });
            return null;
          }
        } catch (error: any) {
          console.error('Create store error:', error);
          set({
            error: error.response?.data?.message || 'Failed to create store',
            loading: false
          });
          return null;
        }
      },

      updateStore: async (storeId, storeData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.put(`/stores/${storeId}`, storeData);
          if (response.data.success) {
            const updatedStore = response.data.data;
            set((state) => ({
              merchantStores: state.merchantStores.map(store =>
                store.id === storeId ? updatedStore : store
              ),
              currentStore: state.selectedStoreId === storeId ? updatedStore : state.currentStore,
              loading: false
            }));
            return updatedStore;
          } else {
            set({ error: response.data.message || 'Failed to update store', loading: false });
            return null;
          }
        } catch (error: any) {
          console.error('Update store error:', error);
          set({
            error: error.response?.data?.message || 'Failed to update store',
            loading: false
          });
          return null;
        }
      },

      deleteStore: async (storeId) => {
        set({ loading: true, error: null });
        try {
          const response = await api.delete(`/stores/${storeId}`);
          if (response.data.success) {
            set((state) => {
              const newStores = state.merchantStores.filter(store => store.id !== storeId);
              return {
                merchantStores: newStores,
                selectedStoreId: state.selectedStoreId === storeId ?
                  (newStores.length > 0 ? newStores[0].id : null) : state.selectedStoreId,
                currentStore: state.selectedStoreId === storeId ?
                  (newStores.length > 0 ? newStores[0] : null) : state.currentStore,
                loading: false
              };
            });
            return true;
          } else {
            set({ error: response.data.message || 'Failed to delete store', loading: false });
            return false;
          }
        } catch (error: any) {
          console.error('Delete store error:', error);
          set({
            error: error.response?.data?.message || 'Failed to delete store',
            loading: false
          });
          return false;
        }
      },

      fetchStoreInventory: async (storeId) => {
        set({ inventoryLoading: true, error: null });
        try {
          const response = await api.get(`/stores/${storeId}/inventory`);
          if (response.data.success) {
            set({ storeInventory: response.data.data, inventoryLoading: false });
          } else {
            set({ error: 'Failed to fetch store inventory', inventoryLoading: false });
          }
        } catch (error: any) {
          console.error('Fetch store inventory error:', error);
          set({
            error: error.response?.data?.message || 'Failed to fetch store inventory',
            inventoryLoading: false
          });
        }
      },

      addSweetToStore: async (storeId, sweetData) => {
        try {
          const response = await api.post(`/stores/${storeId}/sweets`, sweetData);
          if (response.data.success) {
            const newStoreSweet = response.data.data;
            set((state) => ({
              storeInventory: [...state.storeInventory, newStoreSweet]
            }));
            return newStoreSweet;
          } else {
            set({ error: response.data.message || 'Failed to add sweet to store' });
            return null;
          }
        } catch (error: any) {
          console.error('Add sweet to store error:', error);
          set({ error: error.response?.data?.message || 'Failed to add sweet to store' });
          return null;
        }
      },

      updateStoreSweet: async (storeId, sweetId, sweetData) => {
        try {
          const response = await api.put(`/stores/${storeId}/sweets/${sweetId}`, sweetData);
          if (response.data.success) {
            const updatedStoreSweet = response.data.data;
            set((state) => ({
              storeInventory: state.storeInventory.map(item =>
                item.sweetId === sweetId ? updatedStoreSweet : item
              )
            }));
            return updatedStoreSweet;
          } else {
            set({ error: response.data.message || 'Failed to update store sweet' });
            return null;
          }
        } catch (error: any) {
          console.error('Update store sweet error:', error);
          set({ error: error.response?.data?.message || 'Failed to update store sweet' });
          return null;
        }
      },

      removeStoreSweet: async (storeId, sweetId) => {
        try {
          const response = await api.delete(`/stores/${storeId}/sweets/${sweetId}`);
          if (response.data.success) {
            set((state) => ({
              storeInventory: state.storeInventory.filter(item => item.sweetId !== sweetId)
            }));
            return true;
          } else {
            set({ error: response.data.message || 'Failed to remove sweet from store' });
            return false;
          }
        } catch (error: any) {
          console.error('Remove store sweet error:', error);
          set({ error: error.response?.data?.message || 'Failed to remove sweet from store' });
          return false;
        }
      },

      clearStoreData: () => {
        set({
          selectedStoreId: null,
          merchantStores: [],
          currentStore: null,
          storeInventory: [],
          loading: false,
          inventoryLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'merchant-stores-storage',
      partialize: (state) => ({
        selectedStoreId: state.selectedStoreId,
      }),
    }
  )
);