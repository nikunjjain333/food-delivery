import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For local development with Expo:
// Android Emulator: 10.0.2.2
// iOS Simulator: localhost
// Web: localhost
const getBaseUrl = () => {
  const host = '192.168.31.166'; // Local machine IP
  const port = '5000';
  
  if (Platform.OS === 'android') return `http://${host}:${port}/api`;
  if (Platform.OS === 'web') return `http://localhost:${port}/api`;
  return `http://${host}:${port}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
