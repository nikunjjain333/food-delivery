import { View, Text, TouchableOpacity, FlatList, Image, SafeAreaView } from 'react-native';
import { useCartStore, CartItem } from '../../store/useCartStore';
import { Minus, Plus, Trash2 } from 'lucide-react-native';

export default function CartScreen({ navigation }: any) {
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 mb-4 shadow-md">
      <View className="flex-row">
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} className="w-20 h-20 rounded-2xl bg-zinc-800" />
        )}
        <View className="ml-4 flex-1">
          <View className="flex-row justify-between items-start">
            <Text className="text-xl font-bold text-zinc-100 flex-1 mr-2">{item.name}</Text>
            <TouchableOpacity onPress={() => removeItem(item.id)} className="p-1">
              <Trash2 color="#ef4444" size={20} />
            </TouchableOpacity>
          </View>
          <Text className="text-amber-500 font-bold mb-3">₹{item.price}</Text>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center border border-zinc-700 bg-zinc-950 rounded-full px-2 py-1">
              <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} className="p-1">
                <Minus color="#a1a1aa" size={16} />
              </TouchableOpacity>
              <Text className="text-zinc-100 font-bold px-4">{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} className="p-1">
                <Plus color="#f59e0b" size={16} />
              </TouchableOpacity>
            </View>
            <Text className="text-zinc-300 font-bold">₹{item.price * item.quantity}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="flex-1 px-6 pt-6">
        <Text className="text-3xl font-extrabold text-amber-500 mb-6">Your Cart</Text>
        
        {items.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-zinc-500 text-lg mb-4">Your cart is empty.</Text>
            <TouchableOpacity 
              className="bg-zinc-800 px-6 py-3 rounded-xl"
              onPress={() => navigation.navigate('TabHome')}
            >
              <Text className="text-emerald-500 font-bold">Browse Sweets</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderCartItem}
              showsVerticalScrollIndicator={false}
              className="flex-1"
            />
            
            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mt-4 shadow-lg mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-zinc-400 font-medium">Subtotal</Text>
                <Text className="text-zinc-100 font-bold">₹{getCartTotal()}</Text>
              </View>
              <View className="flex-row justify-between mb-4 pb-4 border-b border-zinc-800">
                <Text className="text-zinc-400 font-medium">Delivery Fee</Text>
                <Text className="text-zinc-100 font-bold">₹50</Text>
              </View>
              <View className="flex-row justify-between mb-6">
                <Text className="text-xl text-zinc-100 font-extrabold">Total</Text>
                <Text className="text-xl text-amber-500 font-extrabold">₹{getCartTotal() + 50}</Text>
              </View>
              
              <TouchableOpacity 
                className="w-full bg-amber-500 py-4 items-center rounded-2xl shadow-lg shadow-amber-500/20"
                onPress={() => navigation.navigate('Checkout')}
              >
                <Text className="text-zinc-900 font-bold text-lg">Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
