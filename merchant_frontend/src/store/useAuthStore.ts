import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'CUSTOMER' | 'ADMIN';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  address?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async (userData, token) => {
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    set({ user: userData, token, isAuthenticated: true });
  },
  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    set({ user: null, token: null, isAuthenticated: false });
  },
  initialize: async () => {
    const token = await AsyncStorage.getItem('userToken');
    const userData = await AsyncStorage.getItem('userData');
    if (token && userData) {
      set({ user: JSON.parse(userData), token, isAuthenticated: true });
    }
  },
}));
