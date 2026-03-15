import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';

// Screens
import LoginScreen from '../screens/LoginScreen';
import MerchantRegisterScreen from '../screens/MerchantRegisterScreen';
import MerchantNavigator from './MerchantNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user, initialize } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await initialize();
      setIsInitializing(false);
    };
    checkAuth();
  }, []);

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950">
        <ActivityIndicator color="#f59e0b" size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Flow
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MerchantRegister" component={MerchantRegisterScreen} />
        </Stack.Group>
      ) : (
        // Merchant Flow
        <Stack.Screen name="MerchantApp" component={MerchantNavigator} />
      )}
    </Stack.Navigator>
  );
}

