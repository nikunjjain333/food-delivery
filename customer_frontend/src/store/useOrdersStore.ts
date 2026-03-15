import { create } from 'zustand';
import api from '../api/client';

export interface OrderItem {
  id: string;
  sweetId: string;
  quantity: number;
  price: number;
  sweet: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  items: OrderItem[];
  deliveryAddress: string;
  review?: {
    id: string;
    rating: number;
    comment?: string;
  };
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchCustomerOrders: () => Promise<void>;
  fetchAllOrders: () => Promise<void>;
  createOrder: (orderData: { items: any[], paymentMethod: string, deliveryAddress: string }) => Promise<any>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  submitReview: (reviewData: { orderId: string; rating: number; comment?: string }) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  fetchCustomerOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/orders/my-orders');
      if (response.data.success) {
        set({ orders: response.data.data, loading: false });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch orders', loading: false });
    }
  },
  fetchAllOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/orders/all');
      if (response.data.success) {
        set({ orders: response.data.data, loading: false });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch all orders', loading: false });
    }
  },
  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/orders', orderData);
      if (response.data.success) {
        set((state) => ({ 
          orders: [response.data.data, ...state.orders], 
          loading: false 
        }));
        return response.data.data;
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to place order', loading: false });
      throw error;
    }
  },
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      if (response.data.success) {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status: response.data.data.status } : o))
        }));
      }
    } catch (error: any) {
      console.error('Update status error:', error);
      throw error;
    }
  },
  submitReview: async (reviewData) => {
    set({ loading: true, error: null });
    try {
      await api.post('/orders/rate', reviewData);
      const fetchCustomerOrders = get().fetchCustomerOrders;
      await fetchCustomerOrders();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to submit review', loading: false });
      throw error;
    }
  },
}));
