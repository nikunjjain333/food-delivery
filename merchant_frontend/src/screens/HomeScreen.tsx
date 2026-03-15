import { View, Text, TouchableOpacity } from 'react-native';
import { Store } from 'lucide-react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-900">
      <View className="items-center mb-8">
        <Store color="#f59e0b" size={48} />
        <Text className="text-3xl font-bold text-amber-500 mt-4">Rohit Sweets</Text>
        <Text className="text-xl font-semibold text-white mt-2">Merchant Dashboard</Text>
        <Text className="text-zinc-400 mt-1">Manage your restaurant business</Text>
      </View>
      <TouchableOpacity
        className="bg-amber-500 px-8 py-4 rounded-xl shadow-lg shadow-amber-500/30"
        onPress={() => navigation.navigate('Login')}
      >
        <Text className="text-zinc-900 font-bold text-lg">Continue to Merchant Portal</Text>
      </TouchableOpacity>
    </View>
  );
}
