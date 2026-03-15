import { View, Text, TouchableOpacity } from 'react-native';
import { commonStyles, colors } from '../utils/styles';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={[commonStyles.centerContainer, { backgroundColor: colors.surface }]}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary, marginBottom: 24 }}>Rohit Sweets 🍬</Text>
      <TouchableOpacity
        style={[commonStyles.button, { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={[commonStyles.buttonText, { color: colors.background, fontSize: 18 }]}>Continue to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
