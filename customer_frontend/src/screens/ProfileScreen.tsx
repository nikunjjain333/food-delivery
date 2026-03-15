import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { User, Mail, Shield, LogOut, Save, Edit2, Store, ChevronLeft, MapPin, ClipboardList } from 'lucide-react-native';
import api from '../api/client';

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
    return user?.role === 'ADMIN' ? 'bg-purple-500' : 'bg-amber-500';
  };

  const getRoleIcon = () => {
    return user?.role === 'ADMIN' ? <Store size={16} color="white" /> : <User size={16} color="white" />;
  };

  return (
    <ScrollView className="flex-1 bg-zinc-950">
      <View className="px-6 pt-12 pb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-6"
        >
          <ChevronLeft color="#71717a" size={32} />
        </TouchableOpacity>

        <Text className="text-4xl font-extrabold text-amber-500 mb-2">Profile</Text>
        <Text className="text-zinc-400 mb-8 text-lg">Manage your account</Text>

        {/* User Avatar and Role */}
        <View className="items-center mb-8">
          <View className="w-32 h-32 bg-zinc-900 rounded-full items-center justify-center mb-4 border-4 border-zinc-800">
            <User color="#f59e0b" size={64} />
          </View>
          <View className={`px-4 py-2 rounded-full ${getRoleBadgeColor()} flex-row items-center`}>
            {getRoleIcon()}
            <Text className="text-white font-bold ml-2 uppercase text-xs tracking-wider">
              {user?.role === 'ADMIN' ? 'Merchant' : 'Customer'}
            </Text>
          </View>
        </View>

        {/* Profile Information */}
        <View className="bg-zinc-900 rounded-2xl p-6 mb-6 border border-zinc-800">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Personal Information</Text>
            {!changingPassword && (
              <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                <Edit2 color="#f59e0b" size={20} />
              </TouchableOpacity>
            )}
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-zinc-500 text-sm mb-2">Name</Text>
              {isEditing ? (
                <TextInput
                  className="bg-zinc-800 text-white px-4 py-3 rounded-xl"
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#71717a"
                />
              ) : (
                <Text className="text-white text-lg font-semibold">{user?.name}</Text>
              )}
            </View>

            <View>
              <Text className="text-zinc-500 text-sm mb-2">Email</Text>
              {isEditing ? (
                <TextInput
                  className="bg-zinc-800 text-white px-4 py-3 rounded-xl"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#71717a"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text className="text-white text-lg font-semibold">{user?.email}</Text>
              )}
            </View>

            <View>
              <Text className="text-zinc-500 text-sm mb-2">Default Delivery Address</Text>
              {isEditing ? (
                <TextInput
                  className="bg-zinc-800 text-white px-4 py-3 rounded-xl"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your default address"
                  placeholderTextColor="#71717a"
                  multiline
                />
              ) : (
                <Text className="text-white text-lg font-semibold">{user?.address || 'No address saved'}</Text>
              )}
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity
              className={`bg-amber-500 py-4 rounded-xl items-center mt-6 ${loading ? 'opacity-70' : ''}`}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#09090b" />
              ) : (
                <View className="flex-row items-center">
                  <Save color="#09090b" size={20} />
                  <Text className="text-zinc-950 font-bold ml-2">Save Changes</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Change Password Section */}
        <View className="bg-zinc-900 rounded-2xl p-6 mb-6 border border-zinc-800">
          <TouchableOpacity
            className="flex-row justify-between items-center"
            onPress={() => setChangingPassword(!changingPassword)}
          >
            <View className="flex-row items-center">
              <Shield color="#71717a" size={20} />
              <Text className="text-white font-semibold ml-3">Change Password</Text>
            </View>
            <Text className="text-zinc-500">{changingPassword ? '−' : '+'}</Text>
          </TouchableOpacity>

          {changingPassword && (
            <View className="mt-4 space-y-3">
              <TextInput
                className="bg-zinc-800 text-white px-4 py-3 rounded-xl"
                placeholder="Current Password"
                placeholderTextColor="#71717a"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              <TextInput
                className="bg-zinc-800 text-white px-4 py-3 rounded-xl"
                placeholder="New Password"
                placeholderTextColor="#71717a"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <TextInput
                className="bg-zinc-800 text-white px-4 py-3 rounded-xl"
                placeholder="Confirm New Password"
                placeholderTextColor="#71717a"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity
                className={`bg-amber-500 py-4 rounded-xl items-center mt-4 ${loading ? 'opacity-70' : ''}`}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#09090b" />
                ) : (
                  <Text className="text-zinc-950 font-bold">Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Account Stats (for customers) */}
        {user?.role === 'CUSTOMER' && (
          <View className="bg-zinc-900 rounded-2xl p-6 mb-6 border border-zinc-800">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Account Stats</Text>
              <TouchableOpacity onPress={fetchStats}>
                <Text className="text-amber-500 text-xs font-bold">REFRESH</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-3xl font-bold text-amber-500">{stats.totalOrders}</Text>
                <Text className="text-zinc-500 text-sm mt-1">Total Orders</Text>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-3xl font-bold text-amber-500">₹{stats.totalSpent.toLocaleString()}</Text>
                <Text className="text-zinc-500 text-sm mt-1">Total Spent</Text>
              </View>
            </View>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-red-500/10 border border-red-500 py-5 rounded-2xl items-center flex-row justify-center"
          onPress={handleLogout}
        >
          <LogOut color="#ef4444" size={20} />
          <Text className="text-red-500 font-bold ml-2 uppercase tracking-wider">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}