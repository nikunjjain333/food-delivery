import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { useOrdersStore, Order } from '../../store/useOrdersStore';
import { useCartStore } from '../../store/useCartStore';
import { Clock, ShoppingBag, ChevronRight, RotateCcw, MapPin, Package, CheckCircle2, Star } from 'lucide-react-native';

export default function OrdersHistoryScreen({ navigation }: any) {
  const { orders, loading, fetchCustomerOrders } = useOrdersStore();
  const addItem = useCartStore((state) => state.addItem);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomerOrders();
    setRefreshing(false);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addItem({
        id: item.sweet.id,
        name: item.sweet.name,
        price: item.price,
        imageUrl: item.sweet.imageUrl,
      } as any);
    });
    Alert.alert('Items Added', 'The items from this order have been added to your cart.');
    navigation.navigate('TabCart');
  };

  const [selectedOrderForRating, setSelectedOrderForRating] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { submitReview, loading: orderLoading } = useOrdersStore();

  const handleRatingSubmit = async () => {
    if (!selectedOrderForRating) return;
    
    try {
      await submitReview({
        orderId: selectedOrderForRating.id,
        rating,
        comment
      });
      Alert.alert('Success', 'Thank you for your review!');
      setSelectedOrderForRating(null);
      setRating(5);
      setComment('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-amber-500';
      case 'ACCEPTED': return 'text-blue-500';
      case 'DISPATCHED': return 'text-orange-500';
      case 'DELIVERED': return 'text-emerald-500';
      case 'CANCELLED': return 'text-red-500';
      default: return 'text-zinc-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} color="#f59e0b" />;
      case 'ACCEPTED': return <Package size={16} color="#3b82f6" />;
      case 'DISPATCHED': return <Package size={16} color="#f97316" />;
      case 'DELIVERED': return <CheckCircle2 size={16} color="#10b981" />;
      default: return <Clock size={16} color="#71717a" />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="px-6 py-6 border-b border-zinc-900">
        <Text className="text-3xl font-extrabold text-white">My Orders</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
      >
        {loading && orders.length === 0 ? (
          <ActivityIndicator color="#f59e0b" size="large" className="mt-10" />
        ) : (
          <View className="pb-24">
            {orders.map((order) => (
              <TouchableOpacity 
                key={order.id} 
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-6 shadow-xl"
                activeOpacity={0.8}
              >
                <View className="flex-row justify-between items-center mb-4 border-b border-zinc-800/50 pb-4">
                  <View>
                    <Text className="text-zinc-500 text-xs font-bold uppercase mb-1">Order ID</Text>
                    <Text className="text-white font-mono text-sm">#{order.id.slice(-8).toUpperCase()}</Text>
                  </View>
                  <View className="bg-zinc-950 px-3 py-1.5 rounded-full flex-row items-center border border-zinc-800">
                    {getStatusIcon(order.status)}
                    <Text className={`font-bold text-[10px] ml-1.5 ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Text>
                  </View>
                </View>

                <View className="mb-4">
                  {order.items.map((item, idx) => (
                    <Text key={idx} className="text-zinc-300 text-sm mb-1">
                      {item.quantity}x {item.sweet.name}
                    </Text>
                  ))}
                </View>

                <View className="flex-row justify-between items-center mt-2">
                  <View>
                    <Text className="text-zinc-500 text-xs font-bold uppercase">Total Amount</Text>
                    <Text className="text-amber-500 font-black text-xl">₹{order.totalAmount}</Text>
                  </View>
                  <TouchableOpacity 
                    className="bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl flex-row items-center"
                    onPress={() => handleReorder(order)}
                  >
                    <Text className="text-amber-500 font-bold text-xs mr-2">RE-ORDER</Text>
                    <ChevronRight size={14} color="#f59e0b" />
                  </TouchableOpacity>
                </View>

                {order.status === 'DELIVERED' && !order.review && (
                  <TouchableOpacity 
                    className="mt-4 bg-emerald-500/10 border border-emerald-500/20 py-3 rounded-xl items-center flex-row justify-center"
                    onPress={() => setSelectedOrderForRating(order)}
                  >
                    <Star size={16} color="#10b981" fill="#10b981" />
                    <Text className="text-emerald-500 font-bold ml-2">RATE ORDER</Text>
                  </TouchableOpacity>
                )}

                {order.review && (
                  <View className="mt-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                    <View className="flex-row items-center mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} color={s <= order.review!.rating ? "#f59e0b" : "#27272a"} fill={s <= order.review!.rating ? "#f59e0b" : "transparent"} />
                      ))}
                    </View>
                    <Text className="text-zinc-400 text-sm italic">"{order.review.comment}"</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {orders.length === 0 && !loading && (
              <View className="items-center justify-center py-20">
                <View className="bg-zinc-900 p-8 rounded-full mb-6">
                  <ShoppingBag size={48} color="#27272a" />
                </View>
                <Text className="text-zinc-100 font-bold text-xl mb-2">No orders yet</Text>
                <Text className="text-zinc-500 text-center px-10">Your sweet journey starts here! Place your first order today.</Text>
                <TouchableOpacity 
                  className="mt-8 bg-amber-500 px-8 py-4 rounded-2xl"
                  onPress={() => navigation.navigate('TabHome')}
                >
                  <Text className="text-zinc-950 font-black uppercase">Order Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        visible={!!selectedOrderForRating}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/80 justify-center px-6">
          <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <Text className="text-xl font-bold text-white mb-2">Rate Order</Text>
            <Text className="text-zinc-500 text-sm mb-6">How was your experience with Rohit Sweets?</Text>

            <View className="flex-row justify-center space-x-2 mb-8 items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} className="p-2">
                  <Star size={32} color={s <= rating ? "#f59e0b" : "#27272a"} fill={s <= rating ? "#f59e0b" : "transparent"} />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              className="bg-zinc-950 text-white p-4 rounded-2xl border border-zinc-800 mb-6 h-32"
              placeholder="Add a comment (optional)"
              placeholderTextColor="#71717a"
              multiline
              value={comment}
              onChangeText={setComment}
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="flex-1 py-4 rounded-2xl border border-zinc-800"
                onPress={() => setSelectedOrderForRating(null)}
              >
                <Text className="text-white text-center font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-2 bg-amber-500 py-4 rounded-2xl ml-4"
                onPress={handleRatingSubmit}
                disabled={orderLoading}
              >
                {orderLoading ? (
                  <ActivityIndicator color="#09090b" size="small" />
                ) : (
                  <Text className="text-zinc-950 text-center font-bold px-8">Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
