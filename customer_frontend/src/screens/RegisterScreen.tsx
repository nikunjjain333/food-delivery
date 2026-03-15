import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/client';
import { User, Mail, Lock, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { commonStyles, colors } from '../utils/styles';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setStatusMsg(null);
    setLoading(true);
    try {
      // Always register as customer
      const requestData = { name, email, password, role: 'CUSTOMER' };
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
            'Registration Successful! 🎉',
            `Your account has been created successfully.\n\n${message || 'Please sign in to continue.'}`,
            [
              {
                text: 'Go to Login',
                onPress: () => navigation.navigate('Login')
              }
            ],
            { cancelable: false }
          );
        } else {
          setStatusMsg({ type: 'error', text: message || 'Registration failed.' });
          Alert.alert('Registration Failed', message || 'Something went wrong. Please try again.');
        }
      }
    } catch (error: any) {
      let errorMsg = 'Failed to register. Please try again.';

      if (error.response?.data) {
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
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginBottom: 32 }}
          >
            <ChevronLeft color={colors.textSecondary} size={32} />
          </TouchableOpacity>

          <Text style={{ fontSize: 36, fontWeight: '800', color: colors.primary, marginBottom: 8 }}>Create Account</Text>
          <Text style={{ color: colors.textSecondary, marginBottom: 40, fontSize: 18 }}>Join thousands of food lovers.</Text>

          <View>
            <View style={{ position: 'relative', marginBottom: 16 }}>
              <TextInput
                style={[commonStyles.input, { paddingLeft: 56, paddingRight: 20, paddingVertical: 20, borderRadius: 16 }]}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
              <View style={{ position: 'absolute', left: 20, top: 20 }}>
                <User color={colors.textSecondary} size={20} />
              </View>
            </View>

            <View style={{ position: 'relative', marginBottom: 16 }}>
              <TextInput
                style={[commonStyles.input, { paddingLeft: 56, paddingRight: 20, paddingVertical: 20, borderRadius: 16 }]}
                placeholder="Email address"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <View style={{ position: 'absolute', left: 20, top: 20 }}>
                <Mail color={colors.textSecondary} size={20} />
              </View>
            </View>

            <View style={{ position: 'relative', marginBottom: 16 }}>
              <TextInput
                style={[commonStyles.input, { paddingLeft: 56, paddingRight: 56, paddingVertical: 20, borderRadius: 16 }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <View style={{ position: 'absolute', left: 20, top: 20 }}>
                <Lock color={colors.textSecondary} size={20} />
              </View>
              <TouchableOpacity
                style={{ position: 'absolute', right: 20, top: 20 }}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff color={colors.textSecondary} size={20} />
                ) : (
                  <Eye color={colors.textSecondary} size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {statusMsg && (
            <View style={[
              { padding: 16, borderRadius: 16, marginTop: 16, borderWidth: 1 },
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
              { width: '100%', paddingVertical: 20, borderRadius: 16, marginTop: 32, marginBottom: 40 },
              loading && { opacity: 0.7 }
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color={colors.background} />
                <Text style={{ color: colors.background, fontWeight: 'bold', marginLeft: 8 }}>Creating Account...</Text>
              </View>
            ) : (
              <Text style={{ color: colors.background, fontWeight: '900', fontSize: 20, textTransform: 'uppercase', letterSpacing: 2 }}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}