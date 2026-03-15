import { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useSweetsStore, Sweet } from '../../store/useSweetsStore';
import { useStoresStore } from '../../store/useStoresStore';
import { Plus, LogOut, ShoppingBag, Search, Filter, MapPin, ChevronDown } from 'lucide-react-native';
import { TextInput } from 'react-native';

export default function CustomerHomeScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const { sweets, loading, fetchSweets } = useSweetsStore();
  const { selectedStore, storeMenu, menuLoading, fetchStoreMenu } = useStoresStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadData();
  }, [selectedStore]);

  const loadData = async () => {
    try {
      if (selectedStore) {
        // Load store-specific menu
        await fetchStoreMenu(selectedStore.id);
      } else {
        // Load general sweets catalog
        await fetchSweets();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const categories = ['All', 'Premium', 'Under ₹500', 'Gifts'];

  // Use store menu if available, otherwise use general sweets
  const currentItems = selectedStore ? storeMenu : sweets;

  const filteredSweets = currentItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const price = selectedStore ? item.storePrice || item.price : item.price;

    if (selectedCategory === 'All') return matchesSearch;
    if (selectedCategory === 'Under ₹500') return matchesSearch && price < 500;
    if (selectedCategory === 'Premium') return matchesSearch && price >= 500;
    if (selectedCategory === 'Gifts') return matchesSearch && (item.name.includes('Box') || item.name.includes('Gift'));

    return matchesSearch;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const renderSweet = (sweet: any) => {
    const price = selectedStore ? (sweet.storePrice || sweet.price) : sweet.price;
    const isAvailable = selectedStore ? (sweet.storeAvailable !== false) : (sweet.isAvailable !== false);
    const stock = selectedStore ? (sweet.storeStock || 0) : (sweet.stock || 0);

    return (
      <View key={sweet.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 mb-4 flex-row justify-between items-center shadow-md">
        <View className="flex-row items-center flex-1">
          <Image
            source={{ uri: sweet.imageUrl }}
            className="w-20 h-20 rounded-2xl bg-zinc-800"
          />
          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-zinc-100">{sweet.name}</Text>
            <Text className="text-amber-500 font-bold mt-1 text-lg">₹{price}</Text>
            {selectedStore && (
              <View className="flex-row items-center mt-1">
                {isAvailable ? (
                  <Text className="text-green-400 text-xs">In Stock ({stock})</Text>
                ) : (
                  <Text className="text-red-400 text-xs">Out of Stock</Text>
                )}
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          className={`w-12 h-12 rounded-2xl items-center justify-center shadow-lg ${
            isAvailable
              ? 'bg-amber-500 shadow-amber-500/20 active:bg-amber-600'
              : 'bg-zinc-700'
          }`}
          onPress={() => isAvailable && addItem({ ...sweet, price })}
          disabled={!isAvailable}
        >
          <Plus color={isAvailable ? "#18181b" : "#71717a"} size={24} strokeWidth={3} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="px-6 py-6">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-zinc-500 text-lg">Welcome back,</Text>
            <Text className="text-3xl font-extrabold text-amber-500">{user?.name} ✨</Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800"
          >
            <LogOut size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Store Selection */}
        <TouchableOpacity
          onPress={() => navigation.navigate('StoreSelection', { showCloseButton: true })}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1">
            <MapPin size={20} color="#f59e0b" />
            <View className="ml-3 flex-1">
              {selectedStore ? (
                <>
                  <Text className="text-zinc-100 font-bold">{selectedStore.name}</Text>
                  <Text className="text-zinc-400 text-sm" numberOfLines={1}>
                    {selectedStore.address}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-zinc-100 font-bold">Select a Store</Text>
                  <Text className="text-zinc-400 text-sm">Choose your delivery location</Text>
                </>
              )}
            </View>
          </View>
          <ChevronDown size={20} color="#71717a" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
      >
        <View className="mb-6 mt-2">
          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl flex-row items-center px-4 py-3 mb-4 shadow-sm">
            <Search size={20} color="#71717a" />
            <TextInput
              className="flex-1 ml-3 text-white font-bold"
              placeholder="Search your favorite sweet..."
              placeholderTextColor="#71717a"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full mr-3 border ${selectedCategory === cat ? 'bg-amber-500 border-amber-500' : 'bg-transparent border-zinc-800'}`}
              >
                <Text className={`font-bold text-xs ${selectedCategory === cat ? 'text-zinc-950' : 'text-zinc-500'}`}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="mb-8">
          <View className="bg-amber-500 rounded-3xl p-6 overflow-hidden relative">
            <View className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full" />
            <Text className="text-zinc-950 font-black text-2xl mb-1 uppercase">Festive Deals</Text>
            <Text className="text-zinc-900 font-bold mb-4">Pure ghee sweets at special prices!</Text>
            <TouchableOpacity className="bg-zinc-950 px-6 py-3 rounded-xl self-start">
              <Text className="text-amber-500 font-bold text-xs">EXPLORE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-zinc-100">
            {selectedStore
              ? (selectedCategory === 'All' ? `${selectedStore.name} Menu` : `${selectedCategory}`)
              : (selectedCategory === 'All' ? 'Our Catalog' : `${selectedCategory}`)
            }
          </Text>
          <View className="bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            <Text className="text-amber-500 text-xs font-bold">{filteredSweets.length} Items</Text>
          </View>
        </View>

        {!selectedStore ? (
          <View className="items-center justify-center py-16 px-4">
            <MapPin size={48} color="#71717a" />
            <Text className="text-zinc-300 font-bold text-xl mt-4 text-center">
              Select a Store to View Menu
            </Text>
            <Text className="text-zinc-500 text-center mt-2 mb-6">
              Choose your preferred store location to see available sweets and their prices
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('StoreSelection', { showCloseButton: true })}
              className="bg-amber-500 px-6 py-3 rounded-2xl"
            >
              <Text className="text-zinc-950 font-bold">Browse Stores</Text>
            </TouchableOpacity>
          </View>
        ) : ((loading || menuLoading) && currentItems.length === 0) ? (
          <ActivityIndicator color="#f59e0b" size="large" className="mt-10" />
        ) : (
          <View className="pb-24">
            {filteredSweets.map(renderSweet)}
            {filteredSweets.length === 0 && currentItems.length > 0 && (
              <View className="items-center justify-center py-10">
                <Text className="text-zinc-500 font-bold">No items match your search.</Text>
              </View>
            )}
            {filteredSweets.length === 0 && currentItems.length === 0 && (
              <View className="items-center justify-center py-10">
                <Text className="text-zinc-500 font-bold">No items available at this store.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <TouchableOpacity 
          className="absolute bottom-10 left-6 right-6 bg-amber-500 flex-row justify-between items-center px-6 py-5 rounded-3xl shadow-2xl shadow-amber-500/40"
          activeOpacity={0.9}
          onPress={() => navigation.navigate('TabCart')}
        >
          <View className="flex-row items-center">
            <ShoppingBag size={24} color="#09090b" />
            <Text className="text-zinc-950 font-bold ml-3 text-lg">{cartCount} Items</Text>
          </View>
          <Text className="text-zinc-950 font-black text-lg">VIEW CART</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
