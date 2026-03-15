import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { Plus, Edit2, Trash2, X, MapPin, Phone, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useMerchantStoresStore, CreateStoreData, UpdateStoreData } from '../../store/useMerchantStoresStore';
import { Store } from '../../store/useStoresStore';

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
      <View key={store.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl mb-4 overflow-hidden">
        {/* Store Header */}
        <TouchableOpacity
          onPress={() => toggleStoreExpansion(store.id)}
          className="p-6 flex-row justify-between items-center"
        >
          <View className="flex-1 pr-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-zinc-100">{store.name}</Text>
              <View className={`px-2 py-1 rounded-full ${store.isActive ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                <Text className={`text-xs font-bold ${store.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {store.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-1">
              <MapPin size={14} color="#71717a" />
              <Text className="text-zinc-400 ml-2 text-sm flex-1" numberOfLines={1}>
                {store.address}
              </Text>
            </View>

            {store.phone && (
              <View className="flex-row items-center mb-1">
                <Phone size={14} color="#71717a" />
                <Text className="text-zinc-400 ml-2 text-sm">{store.phone}</Text>
              </View>
            )}

            <View className="flex-row items-center">
              <Clock size={14} color="#f59e0b" />
              <Text className="text-amber-500 ml-2 text-sm font-semibold">
                Radius: {store.deliveryRadius}km
              </Text>
              {store._count && (
                <Text className="text-zinc-500 ml-4 text-sm">
                  {store._count.storeSweets} items
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity
              className="bg-zinc-800 p-2 rounded-xl mr-2"
              onPress={() => handleOpenModal(store)}
            >
              <Edit2 color="#a1a1aa" size={16} />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-zinc-800 p-2 rounded-xl mr-2"
              onPress={() => handleDelete(store)}
            >
              <Trash2 color="#ef4444" size={16} />
            </TouchableOpacity>
            {isExpanded ? (
              <ChevronUp size={20} color="#71717a" />
            ) : (
              <ChevronDown size={20} color="#71717a" />
            )}
          </View>
        </TouchableOpacity>

        {/* Store Inventory (Expanded) */}
        {isExpanded && (
          <View className="border-t border-zinc-800 p-6">
            <Text className="text-lg font-bold text-amber-500 mb-4">Store Inventory</Text>

            {inventoryLoading ? (
              <ActivityIndicator color="#f59e0b" size="small" />
            ) : inventory.length === 0 ? (
              <Text className="text-zinc-500 italic">No items in this store's inventory</Text>
            ) : (
              <View>
                {inventory.slice(0, 3).map((item) => (
                  <View key={item.id} className="flex-row justify-between items-center py-2 border-b border-zinc-800">
                    <View className="flex-1">
                      <Text className="text-zinc-200 font-semibold">{item.sweet.name}</Text>
                      <Text className="text-zinc-500 text-sm">
                        ₹{item.price || item.sweet.price} • Stock: {item.stock}
                      </Text>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${item.isAvailable ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                      <Text className={`text-xs font-bold ${item.isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                      </Text>
                    </View>
                  </View>
                ))}
                {inventory.length > 3 && (
                  <Text className="text-zinc-400 text-sm mt-2 italic">
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
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView
        className="flex-1 px-6 pt-6 mb-20"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-3xl font-extrabold text-amber-500">My Stores</Text>
          <TouchableOpacity
            className="bg-amber-500 w-10 h-10 rounded-full items-center justify-center shadow-md shadow-amber-500/20"
            activeOpacity={0.7}
            onPress={() => handleOpenModal()}
          >
            <Plus color="#18181b" size={24} strokeWidth={3} />
          </TouchableOpacity>
        </View>
        <Text className="text-zinc-400 mb-8">Manage your store locations and inventory</Text>

        {error && (
          <View className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
            <Text className="text-red-400 font-semibold">{error}</Text>
          </View>
        )}

        {loading && merchantStores.length === 0 ? (
          <ActivityIndicator color="#f59e0b" size="large" className="mt-10" />
        ) : (
          <View className="pb-10">
            {merchantStores.length === 0 ? (
              <View className="items-center justify-center py-16">
                <MapPin size={48} color="#71717a" />
                <Text className="text-zinc-300 font-bold text-xl mt-4 text-center">
                  No Stores Yet
                </Text>
                <Text className="text-zinc-500 text-center mt-2 mb-6">
                  Create your first store to start managing your business locations
                </Text>
                <TouchableOpacity
                  onPress={() => handleOpenModal()}
                  className="bg-amber-500 px-6 py-3 rounded-2xl"
                >
                  <Text className="text-zinc-950 font-bold">Create Store</Text>
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
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-zinc-900 rounded-t-[40px] p-8 pb-12 border-t border-zinc-800">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-white">
                {editingStore ? 'Edit Store' : 'Add New Store'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-zinc-800 p-2 rounded-full">
                <X color="#a1a1aa" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-5">
              <View>
                <Text className="text-zinc-500 font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Store Name</Text>
                <TextInput
                  className="bg-zinc-950 border border-zinc-800 text-white p-4 rounded-2xl mb-4"
                  placeholder="e.g. Downtown Branch"
                  placeholderTextColor="#3f3f46"
                  value={form.name}
                  onChangeText={(text) => setForm({...form, name: text})}
                />
              </View>

              <View>
                <Text className="text-zinc-500 font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Address</Text>
                <TextInput
                  className="bg-zinc-950 border border-zinc-800 text-white p-4 rounded-2xl mb-4"
                  placeholder="Full store address"
                  placeholderTextColor="#3f3f46"
                  multiline
                  numberOfLines={2}
                  value={form.address}
                  onChangeText={(text) => setForm({...form, address: text})}
                />
              </View>

              <View className="flex-row justify-between mb-4">
                <View className="w-[48%]">
                  <Text className="text-zinc-500 font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Phone</Text>
                  <TextInput
                    className="bg-zinc-950 border border-zinc-800 text-white p-4 rounded-2xl"
                    placeholder="+91 9876543210"
                    placeholderTextColor="#3f3f46"
                    keyboardType="phone-pad"
                    value={form.phone}
                    onChangeText={(text) => setForm({...form, phone: text})}
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-zinc-500 font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Email</Text>
                  <TextInput
                    className="bg-zinc-950 border border-zinc-800 text-white p-4 rounded-2xl"
                    placeholder="store@email.com"
                    placeholderTextColor="#3f3f46"
                    keyboardType="email-address"
                    value={form.email}
                    onChangeText={(text) => setForm({...form, email: text})}
                  />
                </View>
              </View>

              <View className="flex-row justify-between mb-4">
                <View className="w-[30%]">
                  <Text className="text-zinc-500 font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Latitude</Text>
                  <TextInput
                    className="bg-zinc-950 border border-zinc-800 text-white p-4 rounded-2xl"
                    placeholder="28.7041"
                    placeholderTextColor="#3f3f46"
                    keyboardType="numeric"
                    value={form.latitude}
                    onChangeText={(text) => setForm({...form, latitude: text})}
                  />
                </View>
                <View className="w-[30%]">
                  <Text className="text-zinc-500 font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Longitude</Text>
                  <TextInput
                    className="bg-zinc-950 border border-zinc-800 text-white p-4 rounded-2xl"
                    placeholder="77.1025"
                    placeholderTextColor="#3f3f46"
                    keyboardType="numeric"
                    value={form.longitude}
                    onChangeText={(text) => setForm({...form, longitude: text})}
                  />
                </View>
                <View className="w-[30%]">
                  <Text className="text-zinc-500 font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Radius (km)</Text>
                  <TextInput
                    className="bg-zinc-950 border border-zinc-800 text-white p-4 rounded-2xl"
                    placeholder="5"
                    placeholderTextColor="#3f3f46"
                    keyboardType="numeric"
                    value={form.deliveryRadius}
                    onChangeText={(text) => setForm({...form, deliveryRadius: text})}
                  />
                </View>
              </View>

              <TouchableOpacity
                className="w-full bg-amber-500 py-5 rounded-2xl items-center shadow-xl shadow-amber-500/20 mt-8"
                onPress={handleSubmit}
              >
                <Text className="text-zinc-900 font-black text-lg uppercase tracking-widest">
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