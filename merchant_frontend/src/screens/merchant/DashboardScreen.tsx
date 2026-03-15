import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrdersStore } from '../../store/useOrdersStore';
import { useMerchantStoresStore } from '../../store/useMerchantStoresStore';
import { LogOut, TrendingUp, Package, Clock, Crown, Award, MapPin, ChevronDown } from 'lucide-react-native';
import api from '../../api/client';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const { orders, loading, fetchAllOrders } = useOrdersStore();
  const {
    merchantStores,
    selectedStoreId,
    currentStore,
    setSelectedStoreId,
    fetchMerchantStores
  } = useMerchantStoresStore();
  const [refreshing, setRefreshing] = useState(false);
  const [topSellers, setTopSellers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchAllOrders(),
      fetchTopSellers(),
      fetchMerchantStores()
    ]);
  };

  const fetchTopSellers = async () => {
    try {
      const response = await api.get('/orders/top-sellers');
      if (response.data.success) {
        setTopSellers(response.data.data);
      }
    } catch (error) {
      console.error('Fetch top sellers error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate metrics
  const today = new Date().toDateString();
  const todaySales = orders
    .filter(o => new Date(o.createdAt).toDateString() === today && o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + o.totalAmount, 0);
  
  const activeOrders = orders.filter(o => ['PENDING', 'ACCEPTED', 'DISPATCHED'].includes(o.status)).length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView 
        className="flex-1 px-6 pt-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <View className="bg-amber-500/10 px-3 py-1 rounded-full mb-2 self-start">
              <Text className="text-amber-500 font-bold text-xs">MERCHANT PORTAL</Text>
            </View>
            <Text className="text-zinc-400 text-lg">Business Dashboard</Text>
            <Text className="text-3xl font-extrabold text-amber-500">{user?.name} Sweets</Text>
          </View>
          <TouchableOpacity
            className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl"
            onPress={logout}
          >
            <LogOut color="#ef4444" size={20} />
          </TouchableOpacity>
        </View>

        {/* Store Selection */}
        <TouchableOpacity
          onPress={() => navigation.navigate('TabStores')}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-8 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1">
            <MapPin size={20} color="#f59e0b" />
            <View className="ml-3 flex-1">
              {currentStore ? (
                <>
                  <Text className="text-zinc-100 font-bold">{currentStore.name}</Text>
                  <Text className="text-zinc-400 text-sm" numberOfLines={1}>
                    {currentStore.address}
                  </Text>
                </>
              ) : merchantStores.length > 0 ? (
                <>
                  <Text className="text-zinc-100 font-bold">All Stores</Text>
                  <Text className="text-zinc-400 text-sm">
                    {merchantStores.length} locations available
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-zinc-100 font-bold">Create Your First Store</Text>
                  <Text className="text-zinc-400 text-sm">Add a store location to get started</Text>
                </>
              )}
            </View>
          </View>
          <ChevronDown size={20} color="#71717a" />
        </TouchableOpacity>

        {loading && orders.length === 0 ? (
          <ActivityIndicator color="#f59e0b" size="large" className="mt-10" />
        ) : (
          <>
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[48%] bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-4 shadow-xl">
                <View className="bg-amber-500/10 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                  <TrendingUp color="#f59e0b" size={24} />
                </View>
                <Text className="text-zinc-500 font-bold mb-1">Today's Sales</Text>
                <Text className="text-2xl font-black text-white">₹{todaySales.toLocaleString()}</Text>
              </View>

              <View className="w-[48%] bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-4 shadow-xl">
                <View className="bg-emerald-500/10 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                  <Package color="#10b981" size={24} />
                </View>
                <Text className="text-zinc-500 font-bold mb-1">Active Orders</Text>
                <Text className="text-2xl font-black text-white">{activeOrders}</Text>
              </View>

              <View className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-4 shadow-xl flex-row items-center">
                <View className="bg-amber-500 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                  <Clock color="#09090b" size={24} />
                </View>
                <View>
                  <Text className="text-zinc-500 font-bold mb-1">Requires Attention</Text>
                  <Text className="text-xl font-black text-amber-500">{pendingOrders} New Orders</Text>
                </View>
              </View>
            </View>

            <View className="mt-8 mb-4 flex-row items-center">
              <Crown color="#f59e0b" size={20} />
              <Text className="text-xl font-bold text-zinc-100 ml-2">Top Selling Sweets</Text>
            </View>

            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-6">
              {topSellers.map((sweet, index) => (
                <View key={sweet.id} className="flex-row items-center justify-between mb-4 last:mb-0">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-zinc-800 w-10 h-10 rounded-xl items-center justify-center mr-3">
                      <Text className="text-amber-500 font-bold">{index + 1}</Text>
                    </View>
                    <View>
                      <Text className="text-zinc-100 font-bold">{sweet.name}</Text>
                      <Text className="text-zinc-500 text-xs">{sweet.totalSold} units sold</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-white font-bold">₹{(sweet.price * sweet.totalSold).toLocaleString()}</Text>
                    <Text className="text-zinc-500 text-[10px]">Revenue</Text>
                  </View>
                </View>
              ))}
              {topSellers.length === 0 && (
                <Text className="text-zinc-500 text-center py-4">No sales data yet</Text>
              )}
            </View>

            <View className="flex-row justify-between items-center mt-6 mb-4">
              <Text className="text-xl font-bold text-zinc-100">Recent Activity</Text>
              <TouchableOpacity>
                <Text className="text-amber-500 font-bold text-sm">View All</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-10">
              {orders.slice(0, 5).map((order) => (
                <View 
                  key={order.id} 
                  className="flex-row justify-between py-4 border-b border-zinc-800/50 last:border-0"
                >
                  <View className="flex-1">
                    <Text className="text-zinc-100 font-bold text-lg">#{order.id.slice(-4).toUpperCase()}</Text>
                    <Text className="text-zinc-500 text-sm">{order.user?.name || 'Customer'} • ₹{order.totalAmount}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-xl items-center justify-center self-start ${
                    order.status === 'PENDING' ? 'bg-amber-500/10' : 
                    order.status === 'ACCEPTED' ? 'bg-blue-500/10' :
                    'bg-emerald-500/10'
                  }`}>
                    <Text className={`font-bold text-[10px] ${
                      order.status === 'PENDING' ? 'text-amber-500' : 
                      order.status === 'ACCEPTED' ? 'text-blue-500' :
                      'text-emerald-500'
                    }`}>{order.status}</Text>
                  </View>
                </View>
              ))}
              {orders.length === 0 && (
                <Text className="text-zinc-500 text-center py-4">No recent activity</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
