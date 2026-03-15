import { create } from 'zustand';

export interface Sweet {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface CartItem extends Sweet {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (sweet: Sweet) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (sweet) => set((state) => {
    const existing = state.items.find((item) => item.id === sweet.id);
    if (existing) {
      return {
        items: state.items.map((item) =>
          item.id === sweet.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { items: [...state.items, { ...sweet, quantity: 1 }] };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map((item) => 
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    )
  })),
  clearCart: () => set({ items: [] }),
  getCartTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));
