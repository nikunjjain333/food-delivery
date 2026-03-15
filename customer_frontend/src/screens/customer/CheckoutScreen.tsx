import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useCartStore } from '../../store/useCartStore';
import { useMerchantStore } from '../../store/useMerchantStore';
import { useOrdersStore } from '../../store/useOrdersStore';
import { useAuthStore } from '../../store/useAuthStore';
import { MapPin, CreditCard, Wallet, Banknote, CheckCircle, ArrowLeft, Edit2 } from 'lucide-react-native';

export default function CheckoutScreen({ navigation }: any) {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { configs, fetchConfigs } = useMerchantStore();
  const { createOrder, loading } = useOrdersStore();
  const { user } = useAuthStore();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '123 Sweet Lane, Sugar Town, 400001');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      Alert.alert('Payment Required', 'Please select a payment method');
      return;
    }

    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
      Alert.alert('Address Required', 'Please provide a valid delivery address');
      return;
    }

    try {
      const orderData = {
        items: items.map(item => ({ id: item.id, quantity: item.quantity })),
        paymentMethod: selectedPayment,
        deliveryAddress: deliveryAddress,
      };

      await createOrder(orderData);
      
      Alert.alert(
        'Order Placed! 🎉',
        'Your sweets are being prepared.',
        [{ text: 'Great!', onPress: () => {
          clearCart();
          navigation.reset({
            index: 0,
            routes: [{ name: 'CustomerApp' }],
          });
        }}]
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to place order. Try again.');
    }
  };

  const isEnabled = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config?.value === true;
  };

  const paymentMethods = [
    { id: 'UPI', label: 'UPI / Google Pay', icon: Wallet, enabled: isEnabled('PAYMENT_UPI') },
    { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, enabled: isEnabled('PAYMENT_CARD') },
    { id: 'COD', label: 'Cash on Delivery', icon: Banknote, enabled: isEnabled('PAYMENT_COD') },
  ].filter(method => method.enabled);

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="px-6 py-4 flex-row items-center border-b border-zinc-900">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ArrowLeft color="#71717a" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white ml-2">Checkout</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 mb-24" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-zinc-100">Delivery Address</Text>
          <TouchableOpacity onPress={() => setIsEditingAddress(!isEditingAddress)}>
            <Text className="text-amber-500 font-bold">{isEditingAddress ? 'Save' : 'Change'}</Text>
          </TouchableOpacity>
        </View>

        {isEditingAddress ? (
          <View className="bg-zinc-900 border border-amber-500/50 p-5 rounded-3xl mb-8 shadow-xl">
            <TextInput
              className="text-white font-bold text-base"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              autoFocus
              placeholder="Enter delivery address"
              placeholderTextColor="#71717a"
            />
          </View>
        ) : (
          <TouchableOpacity 
            className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl flex-row items-center mb-8 shadow-xl"
            onPress={() => setIsEditingAddress(true)}
          >
            <View className="bg-amber-500/10 p-3 rounded-2xl mr-4">
              <MapPin color="#f59e0b" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-zinc-100 font-bold mb-1">Deliver to</Text>
              <Text className="text-zinc-500 text-sm overflow-hidden" numberOfLines={2}>{deliveryAddress}</Text>
            </View>
            <Edit2 color="#71717a" size={18} />
          </TouchableOpacity>
        )}

        <Text className="text-lg font-bold text-zinc-100 mb-4">Select Payment Method</Text>
        {paymentMethods.length === 0 ? (
          <View className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl items-center">
            <Text className="text-red-400 text-center font-bold">Temporarily Unavailable</Text>
            <Text className="text-zinc-500 text-center text-sm mt-2">The merchant is not accepting orders at this time. Please check back later.</Text>
          </View>
        ) : (
          <View className="space-y-4 mb-8">
            {paymentMethods.map((method) => {
              const isSelected = selectedPayment === method.id;
              return (
                <TouchableOpacity 
                  key={method.id}
                  className={`border-2 p-5 rounded-3xl flex-row items-center justify-between mb-4 shadow-sm ${isSelected ? 'bg-amber-500/5 border-amber-500' : 'bg-zinc-900 border-zinc-800'}`}
                  onPress={() => setSelectedPayment(method.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isSelected ? 'bg-amber-500/10' : 'bg-zinc-800'}`}>
                      <method.icon color={isSelected ? '#f59e0b' : '#71717a'} size={24} />
                    </View>
                    <Text className={`ml-4 font-bold text-lg ${isSelected ? 'text-amber-500' : 'text-zinc-300'}`}>
                      {method.label}
                    </Text>
                  </View>
                  {isSelected && <CheckCircle color="#f59e0b" size={24} fill="#f59e0b1a" />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View className="absolute bottom-0 w-full bg-zinc-900/95 border-t border-zinc-800 px-6 py-8 shadow-2xl">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-zinc-500 font-bold text-sm uppercase">Total Amount</Text>
            <Text className="text-zinc-400 text-xs mt-1">(Including delivery fee)</Text>
          </View>
          <Text className="text-amber-500 font-black text-3xl">₹{getCartTotal() + 50}</Text>
        </View>
        
        <TouchableOpacity 
          className={`w-full py-5 items-center rounded-2xl shadow-xl ${!selectedPayment || loading ? 'bg-zinc-800 opacity-50' : 'bg-amber-500 shadow-amber-500/20'}`}
          onPress={handlePlaceOrder}
          disabled={!selectedPayment || loading}
        >
          {loading ? (
            <ActivityIndicator color="#09090b" />
          ) : (
            <Text className={`${!selectedPayment ? 'text-zinc-500' : 'text-zinc-950'} font-black text-xl uppercase tracking-widest`}>
              Place Order
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
