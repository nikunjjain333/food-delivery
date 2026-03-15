import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingCart, User, ClipboardList } from 'lucide-react-native';

// Screens
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';
import CartScreen from '../screens/customer/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersHistoryScreen from '../screens/customer/OrdersHistoryScreen';

const Tab = createBottomTabNavigator();

export default function CustomerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b', // zinc-950
          borderTopColor: '#27272a', // zinc-800
          borderTopWidth: 1,
          paddingBottom: 5,
        },
        tabBarActiveTintColor: '#f59e0b', // amber-500
        tabBarInactiveTintColor: '#a1a1aa', // zinc-400
      }}
    >
      <Tab.Screen 
        name="TabHome" 
        component={CustomerHomeScreen} 
        options={{
          tabBarLabel: 'Sweets',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="TabCart" 
        component={CartScreen} 
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="TabOrders" 
        component={OrdersHistoryScreen} 
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="TabProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
