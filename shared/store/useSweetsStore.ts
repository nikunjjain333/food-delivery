import { create } from 'zustand';
import api from '../api/client';

export interface Sweet {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
}

interface SweetsState {
  sweets: Sweet[];
  loading: boolean;
  error: string | null;
  fetchSweets: (all?: boolean) => Promise<void>;
  addSweet: (sweetData: Partial<Sweet>) => Promise<void>;
  updateSweet: (id: string, sweetData: Partial<Sweet>) => Promise<void>;
  deleteSweet: (id: string) => Promise<void>;
}

export const useSweetsStore = create<SweetsState>((set) => ({
  sweets: [],
  loading: false,
  error: null,
  fetchSweets: async (all = false) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/sweets${all ? '?all=true' : ''}`);
      if (response.data.success) {
        set({ sweets: response.data.data, loading: false });
      } else {
        set({ error: response.data.message, loading: false });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch sweets', loading: false });
    }
  },
  addSweet: async (sweetData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/sweets', sweetData);
      if (response.data.success) {
        set((state) => ({ 
          sweets: [...state.sweets, response.data.data], 
          loading: false 
        }));
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to add sweet', loading: false });
      throw error;
    }
  },
  updateSweet: async (id, sweetData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/sweets/${id}`, sweetData);
      if (response.data.success) {
        set((state) => ({
          sweets: state.sweets.map((s) => (s.id === id ? response.data.data : s)),
          loading: false
        }));
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update sweet', loading: false });
      throw error;
    }
  },
  deleteSweet: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/sweets/${id}`);
      if (response.data.success) {
        set((state) => ({
          sweets: state.sweets.filter((s) => s.id !== id),
          loading: false
        }));
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete sweet', loading: false });
      throw error;
    }
  },
}));
