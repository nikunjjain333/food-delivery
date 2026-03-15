import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useOrdersStore, Order } from '../../store/useOrdersStore';
import { Clock, ShoppingBag, User, MapPin } from 'lucide-react-native';

export default function OrdersScreen() {
  const { orders, loading, fetchAllOrders, updateOrderStatus } = useOrdersStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllOrders();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-amber-500 bg-amber-500/10';
      case 'ACCEPTED': return 'text-blue-500 bg-blue-500/10';
      case 'DISPATCHED': return 'text-orange-500 bg-orange-500/10';
      case 'DELIVERED': return 'text-emerald-500 bg-emerald-500/10';
      case 'DECLINED': return 'text-red-500 bg-red-500/10';
      default: return 'text-zinc-500 bg-zinc-500/10';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView 
        className="flex-1 px-6 pt-6 mb-20"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
      >
        <Text className="text-3xl font-extrabold text-amber-500 mb-2">Orders</Text>
        <Text className="text-zinc-400 mb-8">Manage active customer orders</Text>

        {loading && orders.length === 0 ? (
          <ActivityIndicator color="#f59e0b" size="large" className="mt-10" />
        ) : (
          <View className="space-y-6 pb-10">
            {orders.map((order) => (
              <View key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-6">
                
                <View className="flex-row justify-between mb-4 border-b border-zinc-800/50 pb-4">
                  <View>
                    <Text className="text-white font-bold text-xl uppercase">#{order.id.slice(-6)}</Text>
                    <View className="flex-row items-center mt-1">
                      <Clock size={12} color="#71717a" />
                      <Text className="text-zinc-500 text-xs ml-1">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.paymentMethod}
                      </Text>
                    </View>
                  </View>
                  <View className={`px-4 py-1.5 rounded-full items-center justify-center self-start ${getStatusColor(order.status).split(' ').slice(1).join(' ')}`}>
                    <Text className={`font-black text-[10px] ${getStatusColor(order.status).split(' ')[0]}`}>
                      {order.status}
                    </Text>
                  </View>
                </View>

                <View className="mb-6 space-y-3">
                  <View className="flex-row items-center">
                    <User size={16} color="#f59e0b" />
                    <Text className="text-zinc-100 ml-2 font-bold">{order.user?.name}</Text>
                    <Text className="text-zinc-500 text-xs ml-2">({order.user?.email})</Text>
                  </View>

                  <View className="flex-row items-start">
                    <MapPin size={16} color="#71717a" />
                    <Text className="text-zinc-400 text-xs ml-2 flex-1">{order.deliveryAddress}</Text>
                  </View>
                  
                  <View className="bg-zinc-950/50 rounded-2xl p-4 mt-2 border border-zinc-800/50">
                    {order.items.map((item, idx) => (
                      <View key={item.id} className={`flex-row justify-between ${idx !== order.items.length - 1 ? 'mb-3' : ''}`}>
                        <Text className="text-zinc-300 flex-1">{item.quantity}x {item.sweet.name}</Text>
                        <Text className="text-zinc-100 font-bold ml-4">₹{item.price * item.quantity}</Text>
                      </View>
                    ))}
                    <View className="h-[1px] bg-zinc-800 my-3" />
                    <View className="flex-row justify-between items-center">
                      <Text className="text-zinc-500 font-bold">Total Amount</Text>
                      <Text className="text-amber-500 font-black text-xl">₹{order.totalAmount}</Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row space-x-3 mt-2">
                  {order.status === 'PENDING' && (
                    <>
                      <TouchableOpacity 
                        className="flex-1 bg-zinc-800 py-4 rounded-2xl items-center border border-zinc-700"
                        onPress={() => handleStatusUpdate(order.id, 'DECLINED')}
                      >
                        <Text className="text-red-500 font-bold">Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="flex-1 bg-amber-500 py-4 rounded-2xl items-center shadow-lg shadow-amber-500/20"
                        onPress={() => handleStatusUpdate(order.id, 'ACCEPTED')}
                      >
                        <Text className="text-zinc-950 font-black">Accept Order</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {order.status === 'ACCEPTED' && (
                    <TouchableOpacity 
                      className="flex-1 bg-blue-500 py-4 rounded-2xl items-center shadow-lg shadow-blue-500/20"
                      onPress={() => handleStatusUpdate(order.id, 'DISPATCHED')}
                    >
                      <Text className="text-white font-black">Mark as Dispatched</Text>
                    </TouchableOpacity>
                  )}
                  {order.status === 'DISPATCHED' && (
                    <TouchableOpacity 
                      className="flex-1 bg-emerald-500 py-4 rounded-2xl items-center shadow-lg shadow-emerald-500/20"
                      onPress={() => handleStatusUpdate(order.id, 'DELIVERED')}
                    >
                      <Text className="text-white font-black">Mark as Delivered</Text>
                    </TouchableOpacity>
                  )}
                </View>

              </View>
            ))}
            {orders.length === 0 && (
              <View className="items-center justify-center mt-20">
                <ShoppingBag size={64} color="#27272a" />
                <Text className="text-zinc-500 mt-4 text-lg">No orders found</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
