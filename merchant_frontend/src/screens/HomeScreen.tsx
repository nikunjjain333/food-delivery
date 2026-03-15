import { View, Text, TouchableOpacity } from 'react-native';
import { Store } from 'lucide-react-native';
import { commonStyles, colors } from '../utils/styles';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={[commonStyles.centerContainer, { backgroundColor: colors.surface }]}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Store color={colors.primary} size={48} />
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary, marginTop: 16 }}>Rohit Sweets</Text>
        <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginTop: 8 }}>Merchant Dashboard</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Manage your restaurant business</Text>
      </View>
      <TouchableOpacity
        style={[commonStyles.button, { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 }]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={[commonStyles.buttonText, { color: colors.background, fontSize: 18 }]}>Continue to Merchant Portal</Text>
      </TouchableOpacity>
    </View>
  );
}
