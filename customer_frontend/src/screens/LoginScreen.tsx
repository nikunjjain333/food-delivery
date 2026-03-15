import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/client';
import { Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
  const loginStore = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setStatusMsg(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { success, data, message } = response.data;

      if (success) {
        setStatusMsg({ type: 'success', text: 'Login successful! Redirecting...' });
        await loginStore(data.user, data.token);
      } else {
        setStatusMsg({ type: 'error', text: message || 'Invalid credentials' });
        Alert.alert('Login Failed', message || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      let errorMsg = 'Check your connection and try again';
      
      if (error.response?.data) {
        errorMsg = error.response.data.message || errorMsg;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setStatusMsg({ type: 'error', text: errorMsg });
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 items-center justify-center px-6"
      >
        <Text className="text-5xl font-extrabold text-amber-500 mb-2">Rohit Sweets</Text>
        <Text className="text-zinc-400 mb-10 text-lg">Indulge in sweetness, anywhere.</Text>

        <View className="w-full space-y-4">
          <TextInput
            className="w-full bg-zinc-900 text-white px-5 py-5 rounded-2xl border border-zinc-800 focus:border-amber-500"
            placeholder="Email address"
            placeholderTextColor="#71717a"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View className="relative">
            <TextInput
              className="w-full bg-zinc-900 text-white px-5 py-5 pr-14 rounded-2xl border border-zinc-800 focus:border-amber-500"
              placeholder="Password"
              placeholderTextColor="#71717a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              className="absolute right-5 top-5"
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff color="#71717a" size={22} />
              ) : (
                <Eye color="#71717a" size={22} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {statusMsg && (
          <View className={`w-full p-4 rounded-2xl mt-6 ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
            <Text className={`text-center font-bold ${statusMsg.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {statusMsg.text}
            </Text>
          </View>
        )}

        <TouchableOpacity
          className={`w-full bg-amber-500 py-5 items-center rounded-2xl mt-10 shadow-lg shadow-amber-500/20 ${loading ? 'opacity-70' : ''}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#09090b" />
          ) : (
            <Text className="text-zinc-950 font-bold text-xl">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="mt-8 flex-row">
          <Text className="text-zinc-500">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-amber-500 font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}