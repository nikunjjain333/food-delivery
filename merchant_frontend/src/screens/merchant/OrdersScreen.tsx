import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useOrdersStore, Order } from '../../store/useOrdersStore';
import { Clock, ShoppingBag, User, MapPin } from 'lucide-react-native';
import { commonStyles, colors } from '../../utils/styles';

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
      case 'PENDING': return { color: colors.primary, backgroundColor: 'rgba(245, 158, 11, 0.1)' };
      case 'ACCEPTED': return { color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' };
      case 'DISPATCHED': return { color: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)' };
      case 'DELIVERED': return { color: colors.success, backgroundColor: 'rgba(16, 185, 129, 0.1)' };
      case 'DECLINED': return { color: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.1)' };
      default: return { color: colors.textSecondary, backgroundColor: 'rgba(161, 161, 170, 0.1)' };
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, marginBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={{ fontSize: 30, fontWeight: '800', color: colors.primary, marginBottom: 8 }}>Orders</Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 32 }}>Manage active customer orders</Text>

        {loading && orders.length === 0 ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={{ paddingBottom: 40 }}>
            {orders.map((order) => (
              <View key={order.id} style={[commonStyles.card, { borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, marginBottom: 24 }]}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(39, 39, 42, 0.5)', paddingBottom: 16 }}>
                  <View>
                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 20, textTransform: 'uppercase' }}>#{order.id.slice(-6)}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Clock size={12} color={colors.textSecondary} />
                      <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.paymentMethod}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
                    { backgroundColor: getStatusColor(order.status).backgroundColor }
                  ]}>
                    <Text style={[
                      { fontWeight: '900', fontSize: 10 },
                      { color: getStatusColor(order.status).color }
                    ]}>
                      {order.status}
                    </Text>
                  </View>
                </View>

                <View style={{ marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <User size={16} color={colors.primary} />
                    <Text style={{ color: colors.text, marginLeft: 8, fontWeight: 'bold' }}>{order.user?.name}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 8 }}>({order.user?.email})</Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                    <MapPin size={16} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 8, flex: 1 }}>{order.deliveryAddress}</Text>
                  </View>
                  
                  <View style={{ backgroundColor: 'rgba(9, 9, 11, 0.5)', borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: 'rgba(39, 39, 42, 0.5)' }}>
                    {order.items.map((item, idx) => (
                      <View key={item.id} style={[
                        { flexDirection: 'row', justifyContent: 'space-between' },
                        idx !== order.items.length - 1 && { marginBottom: 12 }
                      ]}>
                        <Text style={{ color: colors.text, flex: 1 }}>{item.quantity}x {item.sweet.name}</Text>
                        <Text style={{ color: colors.text, fontWeight: 'bold', marginLeft: 16 }}>₹{item.price * item.quantity}</Text>
                      </View>
                    ))}
                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: colors.textSecondary, fontWeight: 'bold' }}>Total Amount</Text>
                      <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 20 }}>₹{order.totalAmount}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  {order.status === 'PENDING' && (
                    <>
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: colors.border, paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginRight: 12 }}
                        onPress={() => handleStatusUpdate(order.id, 'DECLINED')}
                      >
                        <Text style={{ color: colors.error, fontWeight: 'bold' }}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          commonStyles.button,
                          { flex: 1, paddingVertical: 16, borderRadius: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3.84 }
                        ]}
                        onPress={() => handleStatusUpdate(order.id, 'ACCEPTED')}
                      >
                        <Text style={[commonStyles.buttonText, { color: colors.background, fontWeight: '900' }]}>Accept Order</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {order.status === 'ACCEPTED' && (
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3.84 }}
                      onPress={() => handleStatusUpdate(order.id, 'DISPATCHED')}
                    >
                      <Text style={{ color: 'white', fontWeight: '900' }}>Mark as Dispatched</Text>
                    </TouchableOpacity>
                  )}
                  {order.status === 'DISPATCHED' && (
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: colors.success, paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: colors.success, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3.84 }}
                      onPress={() => handleStatusUpdate(order.id, 'DELIVERED')}
                    >
                      <Text style={{ color: 'white', fontWeight: '900' }}>Mark as Delivered</Text>
                    </TouchableOpacity>
                  )}
                </View>

              </View>
            ))}
            {orders.length === 0 && (
              <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
                <ShoppingBag size={64} color={colors.border} />
                <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 18 }}>No orders found</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
