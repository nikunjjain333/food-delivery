import { create } from 'zustand';
import api from '../api/client';

export interface MerchantConfig {
  id: string;
  key: string;
  value: boolean;
  description?: string;
}

interface MerchantState {
  configs: MerchantConfig[];
  loading: boolean;
  fetchConfigs: () => Promise<void>;
  updateConfig: (key: string, value: boolean) => Promise<void>;
}

export const useMerchantStore = create<MerchantState>((set) => ({
  configs: [],
  loading: false,
  fetchConfigs: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/merchant-configs');
      if (response.data.success) {
        set({ configs: response.data.data, loading: false });
      }
    } catch (error) {
      set({ loading: false });
      console.error('Fetch configs error:', error);
    }
  },
  updateConfig: async (key, value) => {
    try {
      const response = await api.put(`/merchant-configs/${key}`, { value });
      if (response.data.success) {
        set((state) => ({
          configs: state.configs.map((c) => (c.key === key ? response.data.data : c))
        }));
      }
    } catch (error) {
      console.error('Update config error:', error);
      throw error;
    }
  },
}));
