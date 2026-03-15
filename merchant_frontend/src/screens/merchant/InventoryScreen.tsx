import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { useSweetsStore, Sweet } from '../../store/useSweetsStore';
import { commonStyles, colors } from '../../utils/styles';

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
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, marginBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 30, fontWeight: '800', color: colors.primary }}>Inventory</Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3.84 }}
            activeOpacity={0.7}
            onPress={() => handleOpenModal()}
          >
            <Plus color={colors.background} size={24} strokeWidth={3} />
          </TouchableOpacity>
        </View>
        <Text style={{ color: colors.textSecondary, marginBottom: 32 }}>Manage your sweets catalog</Text>

        {loading && sweets.length === 0 ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={{ paddingBottom: 40 }}>
            {sweets.map((sweet) => (
              <View key={sweet.id} style={[commonStyles.card, { borderRadius: 24, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, marginBottom: 16 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Image
                    source={{ uri: sweet.imageUrl }}
                    style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: colors.border }}
                  />
                  <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>{sweet.name}</Text>
                    <Text style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 4 }}>₹{sweet.price} / kg</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, marginRight: 8, backgroundColor: sweet.isAvailable ? colors.success : colors.error }} />
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{sweet.isAvailable ? `In Stock (${sweet.stock})` : 'Out of Stock'}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: colors.border, padding: 8, borderRadius: 12, marginRight: 8 }}
                    onPress={() => handleOpenModal(sweet)}
                  >
                    <Edit2 color={colors.textSecondary} size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: colors.border, padding: 8, borderRadius: 12 }}
                    onPress={() => handleDelete(sweet.id, sweet.name)}
                  >
                    <Trash2 color={colors.error} size={18} />
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
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, paddingBottom: 48, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>{editingSweet ? 'Edit Sweet' : 'Add New Sweet'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ backgroundColor: colors.border, padding: 8, borderRadius: 999 }}>
                <X color={colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Name</Text>
                <TextInput
                  style={[commonStyles.input, { backgroundColor: colors.background, padding: 16, borderRadius: 16, marginBottom: 16 }]}
                  placeholder="e.g. Rasmalai"
                  placeholderTextColor={colors.border}
                  value={form.name}
                  onChangeText={(text) => setForm({...form, name: text})}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ width: '48%' }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Price (₹)</Text>
                  <TextInput
                    style={[commonStyles.input, { backgroundColor: colors.background, padding: 16, borderRadius: 16 }]}
                    placeholder="500"
                    placeholderTextColor={colors.border}
                    keyboardType="numeric"
                    value={form.price}
                    onChangeText={(text) => setForm({...form, price: text})}
                  />
                </View>
                <View style={{ width: '48%' }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Stock (kg)</Text>
                  <TextInput
                    style={[commonStyles.input, { backgroundColor: colors.background, padding: 16, borderRadius: 16 }]}
                    placeholder="50"
                    placeholderTextColor={colors.border}
                    keyboardType="numeric"
                    value={form.stock}
                    onChangeText={(text) => setForm({...form, stock: text})}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Description</Text>
                <TextInput
                  style={[commonStyles.input, { backgroundColor: colors.background, padding: 16, borderRadius: 16, marginBottom: 16 }]}
                  placeholder="Tell us about this sweet..."
                  placeholderTextColor={colors.border}
                  multiline
                  numberOfLines={3}
                  value={form.description}
                  onChangeText={(text) => setForm({...form, description: text})}
                />
              </View>

              <View style={{ marginBottom: 32 }}>
                <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Image URL</Text>
                <TextInput
                  style={[commonStyles.input, { backgroundColor: colors.background, padding: 16, borderRadius: 16 }]}
                  placeholder="https://image-url.com/sweet.jpg"
                  placeholderTextColor={colors.border}
                  value={form.imageUrl}
                  onChangeText={(text) => setForm({...form, imageUrl: text})}
                />
              </View>

              <TouchableOpacity
                style={[
                  commonStyles.button,
                  { width: '100%', paddingVertical: 20, borderRadius: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 3.84 }
                ]}
                onPress={handleSubmit}
              >
                <Text style={{ color: colors.background, fontWeight: '900', fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 }}>
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
