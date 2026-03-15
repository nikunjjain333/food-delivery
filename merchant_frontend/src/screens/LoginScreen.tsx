import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/client';
import { Store, Eye, EyeOff } from 'lucide-react-native';
import { commonStyles, colors } from '../utils/styles';

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
    <SafeAreaView style={commonStyles.container}>
      {/* Merchant Badge */}
      <View style={{ position: 'absolute', top: 48, left: 24, zIndex: 10 }}>
        <View style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: 'rgba(245, 158, 11, 0.3)',
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Store color="#f59e0b" size={20} />
          <Text style={{ color: colors.primary, fontWeight: 'bold', marginLeft: 8 }}>MERCHANT</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}
      >
        <Text style={{ fontSize: 48, fontWeight: '800', color: colors.primary, marginBottom: 8 }}>Rohit Sweets</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Merchant Portal</Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 40, fontSize: 18 }}>Manage your sweet business</Text>

        <View style={{ width: '100%' }}>
          <TextInput
            style={[commonStyles.input, { marginBottom: 16, paddingHorizontal: 20, paddingVertical: 20, borderRadius: 16 }]}
            placeholder="Email address"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[commonStyles.input, { paddingHorizontal: 20, paddingVertical: 20, paddingRight: 56, borderRadius: 16 }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={{ position: 'absolute', right: 20, top: 20 }}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff color={colors.textSecondary} size={22} />
              ) : (
                <Eye color={colors.textSecondary} size={22} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {statusMsg && (
          <View style={[
            { width: '100%', padding: 16, borderRadius: 16, marginTop: 24, borderWidth: 1 },
            statusMsg.type === 'success'
              ? { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }
              : { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }
          ]}>
            <Text style={[
              { textAlign: 'center', fontWeight: 'bold' },
              { color: statusMsg.type === 'success' ? colors.success : colors.error }
            ]}>
              {statusMsg.text}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            commonStyles.button,
            { width: '100%', paddingVertical: 20, borderRadius: 16, marginTop: 40 },
            loading && { opacity: 0.7 }
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[commonStyles.buttonText, { color: colors.background, fontSize: 20 }]}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={{ marginTop: 32, flexDirection: 'row' }}>
          <Text style={{ color: colors.textSecondary }}>New merchant? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('MerchantRegister')}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Register Your Business</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}