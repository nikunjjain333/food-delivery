import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { useSweetsStore, Sweet } from '../../store/useSweetsStore';

export default function InventoryScreen() {
  const { sweets, loading, fetchSweets, deleteSweet, addSweet, updateSweet } = useSweetsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchSweets(true);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSweets(true);
    setRefreshing(false);
  };

  const handleOpenModal = (sweet?: Sweet) => {
    if (sweet) {
      setEditingSweet(sweet);
      setForm({
        name: sweet.name,
        price: sweet.price.toString(),
        stock: sweet.stock.toString(),
        description: sweet.description || '',
        imageUrl: sweet.imageUrl || ''
      });
    } else {
      setEditingSweet(null);
      setForm({
        name: '',
        price: '',
        stock: '',
        description: '',
        imageUrl: ''
      });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.stock) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const sweetData = {
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        description: form.description,
        imageUrl: form.imageUrl || 'https://via.placeholder.com/150'
      };

      if (editingSweet) {
        await updateSweet(editingSweet.id, sweetData);
        Alert.alert('Success', 'Sweet updated successfully');
      } else {
        await addSweet(sweetData);
        Alert.alert('Success', 'Sweet added successfully');
      }
      setModalVisible(false);
      fetchSweets(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to save sweet');
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Sweet',
      `Are you sure you want to remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSweet(id);
              fetchSweets(true);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete sweet');
            }
          }
        },
      ]
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
          <Text className="text-3xl font-extrabold text-amber-500">Inventory</Text>
          <TouchableOpacity 
            className="bg-amber-500 w-10 h-10 rounded-full items-center justify-center shadow-md shadow-amber-500/20"
            activeOpacity={0.7}
            onPress={() => handleOpenModal()}
          >
            <Plus color="#18181b" size={24} strokeWidth={3} />
          </TouchableOpacity>
        </View>
        <Text className="text-zinc-400 mb-8">Manage your sweets catalog</Text>

        {loading && sweets.length === 0 ? (
          <ActivityIndicator color="#f59e0b" size="large" className="mt-10" />
        ) : (
          <View className="space-y-4 pb-10">
            {sweets.map((sweet) => (
              <View key={sweet.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex-row justify-between items-center shadow-lg mb-4">
                <View className="flex-row items-center flex-1">
                  <Image 
                    source={{ uri: sweet.imageUrl }} 
                    className="w-16 h-16 rounded-2xl bg-zinc-800"
                  />
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-bold text-zinc-100">{sweet.name}</Text>
                    <Text className="text-amber-500 font-bold mb-1">₹{sweet.price} / kg</Text>
                    <View className="flex-row items-center">
                      <View className={`w-2 h-2 rounded-full mr-2 ${sweet.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <Text className="text-zinc-400 text-xs">{sweet.isAvailable ? `In Stock (${sweet.stock})` : 'Out of Stock'}</Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row space-x-2 ml-2">
                  <TouchableOpacity 
                    className="bg-zinc-800 p-2 rounded-xl"
                    onPress={() => handleOpenModal(sweet)}
                  >
                    <Edit2 color="#a1a1aa" size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="bg-zinc-800 p-2 rounded-xl"
                    onPress={() => handleDelete(sweet.id, sweet.name)}
                  >
                    <Trash2 color="#ef4444" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-zinc-900 rounded-t-[40px] p-8 pb-12 border-t border-zinc-800">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-white">{editingSweet ? 'Edit Sweet' : 'Add New Sweet'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-zinc-800 p-2 rounded-full">
                <X color="#a1a1aa" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-5">
              <View>
                <Text className="text-zinc-500 font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Name</Text>
                <TextInput
                  className="bg-zinc-950 border border-zinc-800 text-white p-4 rounded-2xl mb-4"
                  placeholder="e.g. Rasmalai"
                  placeholderTextColor="#3f3f46"
                  value={form.name}
                  onChangeText={(text) => setForm({...form, name: text})}
                />
              </View>

              <View className="flex-row justify-between mb-4">
                <View className="w-[48%]">
                  <Text className="text-zinc-500 font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Price (₹)</Text>
                  <TextInput
                    className="bg-zinc-950 border border-zinc-800 text-white p-4 rounded-2xl"
                    placeholder="500"
                    placeholderTextColor="#3f3f46"
                    keyboardType="numeric"
                    value={form.price}
                    onChangeText={(text) => setForm({...form, price: text})}
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-zinc-500 font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Stock (kg)</Text>
                  <TextInput
                    className="bg-zinc-950 border border-zinc-800 text-white p-4 rounded-2xl"
                    placeholder="50"
                    placeholderTextColor="#3f3f46"
                    keyboardType="numeric"
                    value={form.stock}
                    onChangeText={(text) => setForm({...form, stock: text})}
                  />
                </View>
              </View>

              <View>
                <Text className="text-zinc-500 font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Description</Text>
                <TextInput
                  className="bg-zinc-950 border border-zinc-800 text-white p-4 rounded-2xl mb-4"
                  placeholder="Tell us about this sweet..."
                  placeholderTextColor="#3f3f46"
                  multiline
                  numberOfLines={3}
                  value={form.description}
                  onChangeText={(text) => setForm({...form, description: text})}
                />
              </View>

              <View>
                <Text className="text-zinc-500 font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Image URL</Text>
                <TextInput
                  className="bg-zinc-950 border border-zinc-800 text-white p-4 rounded-2xl mb-8"
                  placeholder="https://image-url.com/sweet.jpg"
                  placeholderTextColor="#3f3f46"
                  value={form.imageUrl}
                  onChangeText={(text) => setForm({...form, imageUrl: text})}
                />
              </View>

              <TouchableOpacity 
                className="w-full bg-amber-500 py-5 rounded-2xl items-center shadow-xl shadow-amber-500/20"
                onPress={handleSubmit}
              >
                <Text className="text-zinc-900 font-black text-lg uppercase tracking-widest">
                  {editingSweet ? 'Save Changes' : 'Add Sweet'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
