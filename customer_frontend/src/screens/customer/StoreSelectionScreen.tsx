import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Store, useStoresStore } from '../../store/useStoresStore';
import { MapPin, Navigation, Clock, Phone, Star, ChevronRight, X } from 'lucide-react-native';

interface StoreSelectionScreenProps {
  navigation: any;
  route?: {
    params?: {
      showCloseButton?: boolean;
      onStoreSelect?: (store: Store) => void;
    };
  };
}

export default function StoreSelectionScreen({ navigation, route }: StoreSelectionScreenProps) {
  const {
    stores,
    nearbyStores,
    selectedStore,
    loading,
    error,
    setSelectedStore,
    fetchStores,
    fetchNearbyStores
  } = useStoresStore();

  const [refreshing, setRefreshing] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const showCloseButton = route?.params?.showCloseButton;
  const onStoreSelect = route?.params?.onStoreSelect;

  useEffect(() => {
    loadStores();
    requestLocation();
  }, []);

  const loadStores = async () => {
    await fetchStores();
  };

  const requestLocation = async () => {
    try {
      // For now, we'll use a mock location. In real app, use react-native-geolocation-service
      const mockLocation = { latitude: 28.7041, longitude: 77.1025 }; // Delhi
      setCurrentLocation(mockLocation);
      setLocationEnabled(true);
      await fetchNearbyStores(mockLocation.latitude, mockLocation.longitude);
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStores();
    if (currentLocation) {
      await fetchNearbyStores(currentLocation.latitude, currentLocation.longitude);
    }
    setRefreshing(false);
  };

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    if (onStoreSelect) {
      onStoreSelect(store);
    }
    navigation.goBack();
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m away`;
    return `${distance.toFixed(1)}km away`;
  };

  const formatOperatingHours = (operatingHours: any) => {
    if (!operatingHours) return 'Hours not available';
    return '9:00 AM - 10:00 PM'; // Default hours, can be enhanced
  };

  const renderStore = (store: Store, isNearby: boolean = false) => (
    <TouchableOpacity
      key={store.id}
      className={`bg-zinc-900 border rounded-3xl p-6 mb-4 ${
        selectedStore?.id === store.id
          ? 'border-amber-500 bg-amber-500/5'
          : 'border-zinc-800'
      }`}
      onPress={() => handleStoreSelect(store)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-xl font-bold text-zinc-100 mb-2">{store.name}</Text>

          <View className="flex-row items-center mb-2">
            <MapPin size={16} color="#71717a" />
            <Text className="text-zinc-400 ml-2 flex-1" numberOfLines={2}>
              {store.address}
            </Text>
          </View>

          {isNearby && store.distance !== undefined && (
            <View className="flex-row items-center mb-2">
              <Navigation size={16} color="#f59e0b" />
              <Text className="text-amber-500 ml-2 font-semibold">
                {formatDistance(store.distance)}
              </Text>
            </View>
          )}

          <View className="flex-row items-center mb-2">
            <Clock size={16} color="#71717a" />
            <Text className="text-zinc-400 ml-2">
              {formatOperatingHours(store.operatingHours)}
            </Text>
          </View>

          {store.phone && (
            <View className="flex-row items-center mb-2">
              <Phone size={16} color="#71717a" />
              <Text className="text-zinc-400 ml-2">{store.phone}</Text>
            </View>
          )}

          {store._count?.storeSweets && (
            <View className="flex-row items-center">
              <Star size={16} color="#f59e0b" />
              <Text className="text-amber-500 ml-2 font-semibold">
                {store._count.storeSweets} sweets available
              </Text>
            </View>
          )}
        </View>

        <View className="items-center">
          {selectedStore?.id === store.id && (
            <View className="bg-amber-500 w-6 h-6 rounded-full items-center justify-center mb-2">
              <Text className="text-zinc-950 font-bold text-xs">✓</Text>
            </View>
          )}
          <ChevronRight size={20} color="#71717a" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="px-6 py-6 flex-row justify-between items-center border-b border-zinc-800">
        <View>
          <Text className="text-2xl font-bold text-zinc-100">Select Store</Text>
          <Text className="text-zinc-400 mt-1">Choose your preferred location</Text>
        </View>
        {showCloseButton && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 bg-zinc-900 rounded-xl border border-zinc-800"
          >
            <X size={20} color="#71717a" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
      >
        {selectedStore && (
          <View className="mt-6 mb-4">
            <View className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
              <Text className="text-amber-500 font-bold text-sm mb-1">CURRENTLY SELECTED</Text>
              <Text className="text-zinc-100 font-bold text-lg">{selectedStore.name}</Text>
              <Text className="text-zinc-400">{selectedStore.address}</Text>
            </View>
          </View>
        )}

        {/* Nearby Stores Section */}
        {locationEnabled && nearbyStores.length > 0 && (
          <View className="mt-6">
            <Text className="text-xl font-bold text-zinc-100 mb-4">📍 Nearby Stores</Text>
            {nearbyStores.map((store) => renderStore(store, true))}
          </View>
        )}

        {/* All Stores Section */}
        <View className="mt-6 mb-8">
          <Text className="text-xl font-bold text-zinc-100 mb-4">🏪 All Stores</Text>
          {loading && stores.length === 0 ? (
            <ActivityIndicator color="#f59e0b" size="large" className="mt-10" />
          ) : error ? (
            <View className="items-center py-10">
              <Text className="text-red-400 font-bold mb-2">Error loading stores</Text>
              <Text className="text-zinc-500">{error}</Text>
              <TouchableOpacity
                onPress={onRefresh}
                className="bg-amber-500 px-4 py-2 rounded-xl mt-4"
              >
                <Text className="text-zinc-950 font-bold">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : stores.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-zinc-500 font-bold">No stores available</Text>
            </View>
          ) : (
            stores.map((store) => renderStore(store))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}