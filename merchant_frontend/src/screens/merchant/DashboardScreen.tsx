import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrdersStore } from '../../store/useOrdersStore';
import { useMerchantStoresStore } from '../../store/useMerchantStoresStore';
import { LogOut, TrendingUp, Package, Clock, Crown, Award, MapPin, ChevronDown } from 'lucide-react-native';
import api from '../../api/client';
import { commonStyles, colors } from '../../utils/styles';

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
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View>
            <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginBottom: 8, alignSelf: 'flex-start' }}>
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 }}>MERCHANT PORTAL</Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 18 }}>Business Dashboard</Text>
            <Text style={{ fontSize: 30, fontWeight: '800', color: colors.primary }}>{user?.name} Sweets</Text>
          </View>
          <TouchableOpacity
            style={[commonStyles.card, { padding: 12, borderRadius: 16 }]}
            onPress={logout}
          >
            <LogOut color={colors.error} size={20} />
          </TouchableOpacity>
        </View>

        {/* Store Selection */}
        <TouchableOpacity
          onPress={() => navigation.navigate('TabStores')}
          style={[commonStyles.card, { padding: 16, marginBottom: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <MapPin size={20} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              {currentStore ? (
                <>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>{currentStore.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }} numberOfLines={1}>
                    {currentStore.address}
                  </Text>
                </>
              ) : merchantStores.length > 0 ? (
                <>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>All Stores</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                    {merchantStores.length} locations available
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>Create Your First Store</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Add a store location to get started</Text>
                </>
              )}
            </View>
          </View>
          <ChevronDown size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {loading && orders.length === 0 ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <View style={{ width: '48%', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 20, borderRadius: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
                <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <TrendingUp color={colors.primary} size={24} />
                </View>
                <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 4 }}>Today's Sales</Text>
                <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>₹{todaySales.toLocaleString()}</Text>
              </View>

              <View style={{ width: '48%', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 20, borderRadius: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Package color={colors.success} size={24} />
                </View>
                <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 4 }}>Active Orders</Text>
                <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>{activeOrders}</Text>
              </View>

              <View style={{ width: '100%', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 20, borderRadius: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: colors.primary, width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                  <Clock color={colors.background} size={24} />
                </View>
                <View>
                  <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 4 }}>Requires Attention</Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: colors.primary }}>{pendingOrders} New Orders</Text>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 32, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
              <Crown color={colors.primary} size={20} />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginLeft: 8 }}>Top Selling Sweets</Text>
            </View>

            <View style={[commonStyles.card, { borderRadius: 24, padding: 20, marginBottom: 24 }]}>
              {topSellers.map((sweet, index) => (
                <View key={sweet.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: index === topSellers.length - 1 ? 0 : 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ backgroundColor: colors.border, width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{index + 1}</Text>
                    </View>
                    <View>
                      <Text style={{ color: colors.text, fontWeight: 'bold' }}>{sweet.name}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{sweet.totalSold} units sold</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>₹{(sweet.price * sweet.totalSold).toLocaleString()}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Revenue</Text>
                  </View>
                </View>
              ))}
              {topSellers.length === 0 && (
                <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingVertical: 16 }}>No sales data yet</Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 }}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={[commonStyles.card, { borderRadius: 24, padding: 20, marginBottom: 40 }]}>
              {orders.slice(0, 5).map((order, index) => (
                <View
                  key={order.id}
                  style={[
                    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
                    index !== orders.slice(0, 5).length - 1 && { borderBottomWidth: 1, borderBottomColor: 'rgba(39, 39, 42, 0.5)' }
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>#{order.id.slice(-4).toUpperCase()}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{order.user?.name || 'Customer'} • ₹{order.totalAmount}</Text>
                  </View>
                  <View style={[
                    { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
                    order.status === 'PENDING' ? { backgroundColor: 'rgba(245, 158, 11, 0.1)' } :
                    order.status === 'ACCEPTED' ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } :
                    { backgroundColor: 'rgba(16, 185, 129, 0.1)' }
                  ]}>
                    <Text style={[
                      { fontWeight: 'bold', fontSize: 10 },
                      order.status === 'PENDING' ? { color: colors.primary } :
                      order.status === 'ACCEPTED' ? { color: '#3b82f6' } :
                      { color: colors.success }
                    ]}>{order.status}</Text>
                  </View>
                </View>
              ))}
              {orders.length === 0 && (
                <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingVertical: 16 }}>No recent activity</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
