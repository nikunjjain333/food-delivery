import { View, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-900">
      <Text className="text-3xl font-bold text-amber-500 mb-6">Rohit Sweets 🍬</Text>
      <TouchableOpacity 
        className="bg-amber-500 px-6 py-3 rounded-xl shadow-lg shadow-amber-500/30"
        onPress={() => navigation.navigate('Login')}
      >
        <Text className="text-zinc-900 font-bold text-lg">Continue to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
