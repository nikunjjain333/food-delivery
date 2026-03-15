import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/client';
import { Store, Mail, Lock, ChevronLeft, User, Eye, EyeOff } from 'lucide-react-native';
import { commonStyles, colors } from '../utils/styles';

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

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Store color={colors.primary} size={32} />
            <Text style={{ fontSize: 36, fontWeight: '800', color: colors.primary, marginLeft: 12 }}>Merchant</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Business Registration</Text>
          <Text style={{ color: colors.textSecondary, marginBottom: 40, fontSize: 18 }}>Join as a restaurant partner.</Text>

          <View style={{ marginBottom: 16 }}>
            <View style={{ position: 'relative', marginBottom: 16 }}>
              <TextInput
                style={[commonStyles.input, { paddingLeft: 56, paddingRight: 20, paddingVertical: 20, borderRadius: 16 }]}
                placeholder="Restaurant Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
              <View style={{ position: 'absolute', left: 20, top: 20 }}>
                <Store color={colors.textSecondary} size={20} />
              </View>
            </View>

            <View style={{ position: 'relative', marginBottom: 16 }}>
              <TextInput
                style={[commonStyles.input, { paddingLeft: 56, paddingRight: 20, paddingVertical: 20, borderRadius: 16 }]}
                placeholder="Business Email"
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

          <View style={[commonStyles.card, { marginTop: 24, marginBottom: 32 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              By registering as a merchant, you'll be able to:
            </Text>
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: colors.text, fontSize: 14, marginBottom: 8 }}>• Manage your restaurant menu</Text>
              <Text style={{ color: colors.text, fontSize: 14, marginBottom: 8 }}>• Track and fulfill orders</Text>
              <Text style={{ color: colors.text, fontSize: 14, marginBottom: 8 }}>• View sales analytics</Text>
              <Text style={{ color: colors.text, fontSize: 14 }}>• Manage restaurant profile</Text>
            </View>
          </View>

          {statusMsg && (
            <View style={[
              { padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1 },
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
              { width: '100%', paddingVertical: 20, borderRadius: 16, marginBottom: 40 },
              loading && { opacity: 0.7 }
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color={colors.background} />
                <Text style={{ color: colors.background, fontWeight: 'bold', marginLeft: 8 }}>Creating Merchant Account...</Text>
              </View>
            ) : (
              <Text style={{ color: colors.background, fontWeight: '900', fontSize: 20, textTransform: 'uppercase', letterSpacing: 2 }}>Register as Merchant</Text>
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