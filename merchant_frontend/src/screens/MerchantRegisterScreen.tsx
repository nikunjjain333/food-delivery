import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/client';
import { Store, Mail, Lock, ChevronLeft, User, Eye, EyeOff } from 'lucide-react-native';

export default function MerchantRegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRegister = async () => {
    console.log('Merchant registration attempt:', { name, email, role: 'ADMIN' });
    if (!name || !email || !password) {
      console.log('Registration validation failed: missing fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setStatusMsg(null);
    setLoading(true);

    try {
      const requestData = { name, email, password, role: 'ADMIN' };
      const response = await api.post('/auth/register', requestData);

      if (response.data) {
        const { success, message } = response.data;

        if (success) {
          setStatusMsg({ type: 'success', text: 'Registration Successful! You can now log in.' });
          // Clear form fields
          setName('');
          setEmail('');
          setPassword('');

          Alert.alert(
            'Merchant Registration Successful! 🎉',
            `Your merchant account has been created successfully.\n\n${message || 'Please sign in to manage your restaurant.'}`,
            [
              {
                text: 'Go to Login',
                onPress: () => navigation.navigate('Login')
              }
            ],
            { cancelable: false }
          );
        } else {
          console.log('Registration failed (success=false):', message);
          setStatusMsg({ type: 'error', text: message || 'Registration failed.' });
          Alert.alert('Registration Failed', message || 'Something went wrong. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Registration error caught:', error);
      let errorMsg = 'Failed to register. Please try again.';

      if (error.response?.data) {
        console.log('Error response data:', error.response.data);
        errorMsg = error.response.data.message || errorMsg;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setStatusMsg({ type: 'error', text: errorMsg });
      Alert.alert('Registration Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-12 pb-8">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-8"
          >
            <ChevronLeft color="#71717a" size={32} />
          </TouchableOpacity>

          <View className="flex-row items-center mb-2">
            <Store color="#f59e0b" size={32} />
            <Text className="text-4xl font-extrabold text-amber-500 ml-3">Merchant</Text>
          </View>
          <Text className="text-2xl font-bold text-white mb-2">Business Registration</Text>
          <Text className="text-zinc-400 mb-10 text-lg">Join as a restaurant partner.</Text>

          <View className="space-y-4">
            <View className="relative mb-4">
              <TextInput
                className="w-full bg-zinc-900 text-white pl-14 pr-5 py-5 rounded-2xl border border-zinc-800"
                placeholder="Restaurant Name"
                placeholderTextColor="#71717a"
                value={name}
                onChangeText={setName}
              />
              <View className="absolute left-5 top-5">
                <Store color="#71717a" size={20} />
              </View>
            </View>

            <View className="relative mb-4">
              <TextInput
                className="w-full bg-zinc-900 text-white pl-14 pr-5 py-5 rounded-2xl border border-zinc-800"
                placeholder="Business Email"
                placeholderTextColor="#71717a"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <View className="absolute left-5 top-5">
                <Mail color="#71717a" size={20} />
              </View>
            </View>

            <View className="relative mb-4">
              <TextInput
                className="w-full bg-zinc-900 text-white pl-14 pr-14 py-5 rounded-2xl border border-zinc-800"
                placeholder="Password"
                placeholderTextColor="#71717a"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <View className="absolute left-5 top-5">
                <Lock color="#71717a" size={20} />
              </View>
              <TouchableOpacity
                className="absolute right-5 top-5"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff color="#71717a" size={20} />
                ) : (
                  <Eye color="#71717a" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mt-6 mb-8">
            <Text className="text-zinc-400 text-sm">
              By registering as a merchant, you'll be able to:
            </Text>
            <View className="mt-3 space-y-2">
              <Text className="text-zinc-300 text-sm">• Manage your restaurant menu</Text>
              <Text className="text-zinc-300 text-sm">• Track and fulfill orders</Text>
              <Text className="text-zinc-300 text-sm">• View sales analytics</Text>
              <Text className="text-zinc-300 text-sm">• Manage restaurant profile</Text>
            </View>
          </View>

          {statusMsg && (
            <View className={`p-4 rounded-2xl mb-6 ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
              <Text className={`text-center font-bold ${statusMsg.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {statusMsg.text}
              </Text>
            </View>
          )}

          <TouchableOpacity
            className={`w-full bg-amber-500 py-5 items-center rounded-2xl mb-10 ${loading ? 'opacity-70' : ''}`}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#09090b" />
                <Text className="text-zinc-950 font-bold ml-2">Creating Merchant Account...</Text>
              </View>
            ) : (
              <Text className="text-zinc-950 font-black text-xl uppercase tracking-widest">Register as Merchant</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-zinc-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-amber-500 font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}