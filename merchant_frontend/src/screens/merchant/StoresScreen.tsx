import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { Plus, Edit2, Trash2, X, MapPin, Phone, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useMerchantStoresStore, CreateStoreData, UpdateStoreData } from '../../store/useMerchantStoresStore';
import { Store } from '../../store/useStoresStore';
import { commonStyles, colors } from '../../utils/styles';

export default function StoresScreen() {
  const {
    merchantStores,
    selectedStoreId,
    currentStore,
    loading,
    error,
    storeInventory,
    inventoryLoading,
    setSelectedStoreId,
    fetchMerchantStores,
    createStore,
    updateStore,
    deleteStore,
    fetchStoreInventory
  } = useMerchantStoresStore();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    deliveryRadius: '5'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStoreId && !inventoryLoading) {
      fetchStoreInventory(selectedStoreId);
    }
  }, [selectedStoreId]);

  const loadData = async () => {
    await fetchMerchantStores();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOpenModal = (store?: Store) => {
    if (store) {
      setEditingStore(store);
      setForm({
        name: store.name,
        address: store.address,
        phone: store.phone || '',
        email: store.email || '',
        latitude: store.latitude?.toString() || '',
        longitude: store.longitude?.toString() || '',
        deliveryRadius: store.deliveryRadius.toString()
      });
    } else {
      setEditingStore(null);
      setForm({
        name: '',
        address: '',
        phone: '',
        email: '',
        latitude: '',
        longitude: '',
        deliveryRadius: '5'
      });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.address) {
      Alert.alert('Error', 'Please fill in name and address');
      return;
    }

    try {
      const storeData: CreateStoreData | UpdateStoreData = {
        name: form.name,
        address: form.address,
        phone: form.phone || undefined,
        email: form.email || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        deliveryRadius: parseFloat(form.deliveryRadius)
      };

      if (editingStore) {
        await updateStore(editingStore.id, storeData as UpdateStoreData);
        Alert.alert('Success', 'Store updated successfully');
      } else {
        await createStore(storeData as CreateStoreData);
        Alert.alert('Success', 'Store created successfully');
      }
      setModalVisible(false);
      loadData();
    } catch (err) {
      Alert.alert('Error', 'Failed to save store');
    }
  };

  const handleDelete = (store: Store) => {
    Alert.alert(
      'Delete Store',
      `Are you sure you want to delete ${store.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteStore(store.id);
              if (success) {
                Alert.alert('Success', 'Store deleted successfully');
                loadData();
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete store');
            }
          }
        },
      ]
    );
  };

  const toggleStoreExpansion = (storeId: string) => {
    const newExpanded = new Set(expandedStores);
    if (newExpanded.has(storeId)) {
      newExpanded.delete(storeId);
    } else {
      newExpanded.add(storeId);
      setSelectedStoreId(storeId);
    }
    setExpandedStores(newExpanded);
  };

  const renderStore = (store: Store) => {
    const isExpanded = expandedStores.has(store.id);
    const isSelected = selectedStoreId === store.id;
    const inventory = isSelected ? storeInventory : [];

    return (
      <View key={store.id} style={[commonStyles.card, { borderRadius: 24, marginBottom: 16, overflow: 'hidden' }]}>
        {/* Store Header */}
        <TouchableOpacity
          onPress={() => toggleStoreExpansion(store.id)}
          style={{ padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flex: 1, paddingRight: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>{store.name}</Text>
              <View style={[
                { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
                store.isActive ? { backgroundColor: 'rgba(16, 185, 129, 0.2)' } : { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
              ]}>
                <Text style={[
                  { fontSize: 12, fontWeight: 'bold' },
                  store.isActive ? { color: '#10b981' } : { color: colors.error }
                ]}>
                  {store.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginLeft: 8, fontSize: 14, flex: 1 }} numberOfLines={1}>
                {store.address}
              </Text>
            </View>

            {store.phone && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Phone size={14} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, marginLeft: 8, fontSize: 14 }}>{store.phone}</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, marginLeft: 8, fontSize: 14, fontWeight: '600' }}>
                Radius: {store.deliveryRadius}km
              </Text>
              {store._count && (
                <Text style={{ color: colors.textSecondary, marginLeft: 16, fontSize: 14 }}>
                  {store._count.storeSweets} items
                </Text>
              )}
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ backgroundColor: colors.border, padding: 8, borderRadius: 12, marginRight: 8 }}
              onPress={() => handleOpenModal(store)}
            >
              <Edit2 color={colors.textSecondary} size={16} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: colors.border, padding: 8, borderRadius: 12, marginRight: 8 }}
              onPress={() => handleDelete(store)}
            >
              <Trash2 color={colors.error} size={16} />
            </TouchableOpacity>
            {isExpanded ? (
              <ChevronUp size={20} color={colors.textSecondary} />
            ) : (
              <ChevronDown size={20} color={colors.textSecondary} />
            )}
          </View>
        </TouchableOpacity>

        {/* Store Inventory (Expanded) */}
        {isExpanded && (
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 16 }}>Store Inventory</Text>

            {inventoryLoading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : inventory.length === 0 ? (
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>No items in this store's inventory</Text>
            ) : (
              <View>
                {inventory.slice(0, 3).map((item) => (
                  <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{item.sweet.name}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                        ₹{item.price || item.sweet.price} • Stock: {item.stock}
                      </Text>
                    </View>
                    <View style={[
                      { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
                      item.isAvailable ? { backgroundColor: 'rgba(16, 185, 129, 0.2)' } : { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
                    ]}>
                      <Text style={[
                        { fontSize: 12, fontWeight: 'bold' },
                        item.isAvailable ? { color: '#10b981' } : { color: colors.error }
                      ]}>
                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                      </Text>
                    </View>
                  </View>
                ))}
                {inventory.length > 3 && (
                  <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, fontStyle: 'italic' }}>
                    +{inventory.length - 3} more items
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, marginBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 30, fontWeight: '800', color: colors.primary }}>My Stores</Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3.84 }}
            activeOpacity={0.7}
            onPress={() => handleOpenModal()}
          >
            <Plus color={colors.background} size={24} strokeWidth={3} />
          </TouchableOpacity>
        </View>
        <Text style={{ color: colors.textSecondary, marginBottom: 32 }}>Manage your store locations and inventory</Text>

        {error && (
          <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: 16, padding: 16, marginBottom: 24 }}>
            <Text style={{ color: colors.error, fontWeight: '600' }}>{error}</Text>
          </View>
        )}

        {loading && merchantStores.length === 0 ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={{ paddingBottom: 40 }}>
            {merchantStores.length === 0 ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64 }}>
                <MapPin size={48} color={colors.textSecondary} />
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 20, marginTop: 16, textAlign: 'center' }}>
                  No Stores Yet
                </Text>
                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
                  Create your first store to start managing your business locations
                </Text>
                <TouchableOpacity
                  onPress={() => handleOpenModal()}
                  style={[commonStyles.button, { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }]}
                >
                  <Text style={[commonStyles.buttonText, { color: colors.background }]}>Create Store</Text>
                </TouchableOpacity>
              </View>
            ) : (
              merchantStores.map(renderStore)
            )}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Store Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, paddingBottom: 48, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>
                {editingStore ? 'Edit Store' : 'Add New Store'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ backgroundColor: colors.border, padding: 8, borderRadius: 999 }}>
                <X color={colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Store Name</Text>
                <TextInput
                  style={[commonStyles.input, { backgroundColor: colors.background, padding: 16, borderRadius: 16, marginBottom: 16 }]}
                  placeholder="e.g. Downtown Branch"
                  placeholderTextColor={colors.border}
                  value={form.name}
                  onChangeText={(text) => setForm({...form, name: text})}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Address</Text>
                <TextInput
                  style={[commonStyles.input, { backgroundColor: colors.background, padding: 16, borderRadius: 16, marginBottom: 16 }]}
                  placeholder="Full store address"
                  placeholderTextColor={colors.border}
                  multiline
                  numberOfLines={2}
                  value={form.address}
                  onChangeText={(text) => setForm({...form, address: text})}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ width: '48%' }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Phone</Text>
                  <TextInput
                    style={[commonStyles.input, { backgroundColor: colors.background, padding: 16, borderRadius: 16 }]}
                    placeholder="+91 9876543210"
                    placeholderTextColor={colors.border}
                    keyboardType="phone-pad"
                    value={form.phone}
                    onChangeText={(text) => setForm({...form, phone: text})}
                  />
                </View>
                <View style={{ width: '48%' }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Email</Text>
                  <TextInput
                    style={[commonStyles.input, { backgroundColor: colors.background, padding: 16, borderRadius: 16 }]}
                    placeholder="store@email.com"
                    placeholderTextColor={colors.border}
                    keyboardType="email-address"
                    value={form.email}
                    onChangeText={(text) => setForm({...form, email: text})}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ width: '30%' }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Latitude</Text>
                  <TextInput
                    style={[commonStyles.input, { backgroundColor: colors.background, padding: 16, borderRadius: 16 }]}
                    placeholder="28.7041"
                    placeholderTextColor={colors.border}
                    keyboardType="numeric"
                    value={form.latitude}
                    onChangeText={(text) => setForm({...form, latitude: text})}
                  />
                </View>
                <View style={{ width: '30%' }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Longitude</Text>
                  <TextInput
                    style={[commonStyles.input, { backgroundColor: colors.background, padding: 16, borderRadius: 16 }]}
                    placeholder="77.1025"
                    placeholderTextColor={colors.border}
                    keyboardType="numeric"
                    value={form.longitude}
                    onChangeText={(text) => setForm({...form, longitude: text})}
                  />
                </View>
                <View style={{ width: '30%' }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Radius (km)</Text>
                  <TextInput
                    style={[commonStyles.input, { backgroundColor: colors.background, padding: 16, borderRadius: 16 }]}
                    placeholder="5"
                    placeholderTextColor={colors.border}
                    keyboardType="numeric"
                    value={form.deliveryRadius}
                    onChangeText={(text) => setForm({...form, deliveryRadius: text})}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  commonStyles.button,
                  { width: '100%', paddingVertical: 20, borderRadius: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 3.84, marginTop: 32 }
                ]}
                onPress={handleSubmit}
              >
                <Text style={{ color: colors.background, fontWeight: '900', fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 }}>
                  {editingStore ? 'Update Store' : 'Create Store'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}