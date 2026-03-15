import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Package, User, Store, MapPin } from 'lucide-react-native';

// Screens
import DashboardScreen from '../screens/merchant/DashboardScreen';
import OrdersScreen from '../screens/merchant/OrdersScreen';
import InventoryScreen from '../screens/merchant/InventoryScreen';
import StoresScreen from '../screens/merchant/StoresScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MerchantNavigator() {
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
        name="TabDashboard" 
        component={DashboardScreen} 
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="TabOrders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="TabInventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size }) => <Store color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="TabStores"
        component={StoresScreen}
        options={{
          tabBarLabel: 'Stores',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
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
