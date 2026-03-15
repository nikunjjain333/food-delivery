import { View, Text, TouchableOpacity, FlatList, Image, SafeAreaView } from 'react-native';
import { useCartStore, CartItem } from '../../store/useCartStore';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { commonStyles, colors } from '../../utils/styles';

export default function CartScreen({ navigation }: any) {
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={[commonStyles.card, { borderRadius: 24, marginBottom: 16 }]}>
      <View style={{ flexDirection: 'row' }}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: colors.surface }} />
        )}
        <View style={{ marginLeft: 16, flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, flex: 1, marginRight: 8 }}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeItem(item.id)} style={{ padding: 4 }}>
              <Trash2 color={colors.error} size={20} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 12 }}>₹{item.price}</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 }}>
              <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: 4 }}>
                <Minus color={colors.textSecondary} size={16} />
              </TouchableOpacity>
              <Text style={{ color: colors.text, fontWeight: 'bold', paddingHorizontal: 16 }}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: 4 }}>
                <Plus color={colors.primary} size={16} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>₹{item.price * item.quantity}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: colors.primary, marginBottom: 24 }}>Your Cart</Text>
        
        {items.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 18, marginBottom: 16 }}>Your cart is empty.</Text>
            <TouchableOpacity
              style={{ backgroundColor: colors.surface, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
              onPress={() => navigation.navigate('TabHome')}
            >
              <Text style={{ color: colors.success, fontWeight: 'bold' }}>Browse Sweets</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderCartItem}
              showsVerticalScrollIndicator={false}
style={{ flex: 1 }}
            />
            
            <View style={[commonStyles.card, { borderRadius: 24, marginTop: 16, marginBottom: 24 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>Subtotal</Text>
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>₹{getCartTotal()}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>Delivery Fee</Text>
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>₹50</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                <Text style={{ fontSize: 20, color: colors.text, fontWeight: '800' }}>Total</Text>
                <Text style={{ fontSize: 20, color: colors.primary, fontWeight: '800' }}>₹{getCartTotal() + 50}</Text>
              </View>
              
              <TouchableOpacity
                style={[commonStyles.button, { width: '100%', paddingVertical: 16, borderRadius: 16 }]}
                onPress={() => navigation.navigate('Checkout')}
              >
                <Text style={[commonStyles.buttonText, { color: colors.background, fontSize: 18 }]}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
