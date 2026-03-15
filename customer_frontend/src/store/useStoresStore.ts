import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

export interface Store {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  operatingHours?: any;
  deliveryRadius: number;
  merchantId: string;
  merchant?: {
    id: string;
    name: string;
    email: string;
  };
  distance?: number;
  _count?: {
    storeSweets: number;
    orders?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoreMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  storePrice: number;
  imageUrl?: string;
  isAvailable: boolean;
  stock: number;
  storeStock: number;
  storeAvailable: boolean;
  category?: string;
  storeSweetId: string;
  createdAt: string;
  updatedAt: string;
}

interface StoresState {
  // Store selection
  selectedStore: Store | null;
  stores: Store[];
  nearbyStores: Store[];
  loading: boolean;
  error: string | null;

  // Store menu
  storeMenu: StoreMenuItem[];
  menuLoading: boolean;

  // Actions
  setSelectedStore: (store: Store | null) => void;
  fetchStores: () => Promise<void>;
  fetchNearbyStores: (latitude: number, longitude: number, radius?: number) => Promise<void>;
  fetchStoreById: (id: string) => Promise<Store | null>;
  fetchStoreMenu: (storeId: string) => Promise<void>;
  clearStores: () => void;
}

export const useStoresStore = create<StoresState>()(
  persist(
    (set, get) => ({
      selectedStore: null,
      stores: [],
      nearbyStores: [],
      loading: false,
      error: null,
      storeMenu: [],
      menuLoading: false,

      setSelectedStore: (store) => {
        set({ selectedStore: store });
        // Clear menu when store changes
        if (store === null) {
          set({ storeMenu: [] });
        }
      },

      fetchStores: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/stores/all');
          if (response.data.success) {
            set({ stores: response.data.data, loading: false });
          } else {
            set({ error: 'Failed to fetch stores', loading: false });
          }
        } catch (error: any) {
          console.error('Fetch stores error:', error);
          set({
            error: error.response?.data?.message || 'Failed to fetch stores',
            loading: false
          });
        }
      },

      fetchNearbyStores: async (latitude, longitude, radius = 10) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/stores/nearby', {
            params: { latitude, longitude, radius }
          });
          if (response.data.success) {
            set({ nearbyStores: response.data.data, loading: false });
          } else {
            set({ error: 'Failed to fetch nearby stores', loading: false });
          }
        } catch (error: any) {
          console.error('Fetch nearby stores error:', error);
          set({
            error: error.response?.data?.message || 'Failed to fetch nearby stores',
            loading: false
          });
        }
      },

      fetchStoreById: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/stores/${id}`);
          if (response.data.success) {
            set({ loading: false });
            return response.data.data;
          } else {
            set({ error: 'Store not found', loading: false });
            return null;
          }
        } catch (error: any) {
          console.error('Fetch store by ID error:', error);
          set({
            error: error.response?.data?.message || 'Failed to fetch store',
            loading: false
          });
          return null;
        }
      },

      fetchStoreMenu: async (storeId) => {
        set({ menuLoading: true, error: null });
        try {
          const response = await api.get(`/stores/${storeId}/menu`);
          if (response.data.success) {
            set({
              storeMenu: response.data.data.menu,
              menuLoading: false
            });
          } else {
            set({ error: 'Failed to fetch store menu', menuLoading: false });
          }
        } catch (error: any) {
          console.error('Fetch store menu error:', error);
          set({
            error: error.response?.data?.message || 'Failed to fetch store menu',
            menuLoading: false
          });
        }
      },

      clearStores: () => {
        set({
          selectedStore: null,
          stores: [],
          nearbyStores: [],
          storeMenu: [],
          loading: false,
          menuLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'stores-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedStore: state.selectedStore,
      }),
    }
  )
);