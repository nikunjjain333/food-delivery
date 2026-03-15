import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { User, Mail, Shield, LogOut, Save, Edit2, Store, ChevronLeft, MapPin, ClipboardList } from 'lucide-react-native';
import api from '../api/client';
import { commonStyles, colors } from '../utils/styles';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0 });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/auth/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/auth/profile', { name, email, address });

      if (response.data.success) {
        const updatedUser = { ...user!, name, email, address };
        await useAuthStore.getState().login(updatedUser, useAuthStore.getState().token!);

        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (response.data.success) {
        Alert.alert('Success', 'Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setChangingPassword(false);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = () => {
    return user?.role === 'ADMIN' ? '#8b5cf6' : colors.primary;
  };

  const getRoleIcon = () => {
    return user?.role === 'ADMIN' ? <Store size={16} color="white" /> : <User size={16} color="white" />;
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={{ paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 24 }}
        >
          <ChevronLeft color={colors.textSecondary} size={32} />
        </TouchableOpacity>

        <Text style={{ fontSize: 36, fontWeight: '800', color: colors.primary, marginBottom: 8 }}>Profile</Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 32, fontSize: 18 }}>Manage your account</Text>

        {/* User Avatar and Role */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ width: 128, height: 128, backgroundColor: colors.surface, borderRadius: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 4, borderColor: colors.border }}>
            <User color={colors.primary} size={64} />
          </View>
          <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: getRoleBadgeColor(), flexDirection: 'row', alignItems: 'center' }}>
            {getRoleIcon()}
            <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>
              {user?.role === 'ADMIN' ? 'Merchant' : 'Customer'}
            </Text>
          </View>
        </View>

        {/* Profile Information */}
        <View style={[commonStyles.card, { marginBottom: 24 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: colors.textSecondary, fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12, letterSpacing: 2 }}>Personal Information</Text>
            {!changingPassword && (
              <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                <Edit2 color={colors.primary} size={20} />
              </TouchableOpacity>
            )}
          </View>

          <View style={{  }}>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8 }}>Name</Text>
              {isEditing ? (
                <TextInput
                  style={[commonStyles.input, { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>{user?.name}</Text>
              )}
            </View>

            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8 }}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={[commonStyles.input, { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>{user?.email}</Text>
              )}
            </View>

            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8 }}>Default Delivery Address</Text>
              {isEditing ? (
                <TextInput
                  style={[commonStyles.input, { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your default address"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
              ) : (
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>{user?.address || 'No address saved'}</Text>
              )}
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity
              style={[
                commonStyles.button,
                { paddingVertical: 16, borderRadius: 12, marginTop: 24 },
                loading && { opacity: 0.7 }
              ]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Save color={colors.background} size={20} />
                  <Text style={[commonStyles.buttonText, { color: colors.background, marginLeft: 8 }]}>Save Changes</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Change Password Section */}
        <View style={[commonStyles.card, { marginBottom: 24 }]}>
          <TouchableOpacity
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            onPress={() => setChangingPassword(!changingPassword)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Shield color={colors.textSecondary} size={20} />
              <Text style={{ color: colors.text, fontWeight: '600', marginLeft: 12 }}>Change Password</Text>
            </View>
            <Text style={{ color: colors.textSecondary }}>{changingPassword ? '−' : '+'}</Text>
          </TouchableOpacity>

          {changingPassword && (
            <View style={{ marginTop: 16 }}>
              <TextInput
                style={[commonStyles.input, { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }]}
                placeholder="Current Password"
                placeholderTextColor={colors.textSecondary}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              <TextInput
                style={[commonStyles.input, { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }]}
                placeholder="New Password"
                placeholderTextColor={colors.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <TextInput
                style={[commonStyles.input, { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }]}
                placeholder="Confirm New Password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={[
                  commonStyles.button,
                  { paddingVertical: 16, borderRadius: 12, marginTop: 16 },
                  loading && { opacity: 0.7 }
                ]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={[commonStyles.buttonText, { color: colors.background }]}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Account Stats (for customers) */}
        {user?.role === 'CUSTOMER' && (
          <View style={[commonStyles.card, { marginBottom: 24 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: colors.textSecondary, fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12, letterSpacing: 2 }}>Account Stats</Text>
              <TouchableOpacity onPress={fetchStats}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>REFRESH</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary }}>{stats.totalOrders}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>Total Orders</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary }}>₹{stats.totalSpent.toLocaleString()}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>Total Spent</Text>
              </View>
            </View>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 1,
            borderColor: colors.error,
            paddingVertical: 20,
            borderRadius: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={handleLogout}
        >
          <LogOut color={colors.error} size={20} />
          <Text style={{ color: colors.error, fontWeight: 'bold', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}