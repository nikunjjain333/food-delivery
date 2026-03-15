import { useEffect } from 'react';
import { View, Text, SafeAreaView, Switch, ActivityIndicator, ScrollView } from 'react-native';
import { useMerchantStore } from '../../store/useMerchantStore';
import { Wallet, CreditCard, Banknote } from 'lucide-react-native';

export default function SettingsScreen() {
  const { configs, loading, fetchConfigs, updateConfig } = useMerchantStore();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    // Prisma returns boolean as the value (mapped from Json/String in seed)
    // Actually in my seed I used boolean. Prisma schema says Json.
    return !!config?.value;
  };

  const handleToggle = async (key: string) => {
    const currentValue = getConfigValue(key);
    try {
      // Toggle value logic - simplified for now as boolean
      await updateConfig(key, !currentValue);
      await fetchConfigs(); // Refresh to ensure UI sync
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-6">
        <Text className="text-3xl font-extrabold text-amber-500 mb-2">Settings</Text>
        <Text className="text-zinc-400 mb-8">Manage store configurations</Text>

        <Text className="text-lg font-bold text-zinc-100 mb-4">Payment Methods</Text>
        
        {loading && configs.length === 0 ? (
          <ActivityIndicator color="#f59e0b" size="large" className="mt-10" />
        ) : (
          <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-2 shadow-xl">
            
            <View className="flex-row items-center justify-between p-5 border-b border-zinc-800/50">
              <View className="flex-row items-center">
                <View className="bg-zinc-800 w-12 h-12 rounded-2xl items-center justify-center">
                  <Wallet color="#f59e0b" size={24} />
                </View>
                <View className="ml-4">
                  <Text className="text-zinc-100 font-bold text-base">UPI / Google Pay</Text>
                  <Text className="text-zinc-500 text-xs">Direct bank transfer</Text>
                </View>
              </View>
              <Switch 
                value={getConfigValue('PAYMENT_UPI')} 
                onValueChange={() => handleToggle('PAYMENT_UPI')} 
                trackColor={{ false: '#27272a', true: '#f59e0b' }}
                thumbColor="#fff"
              />
            </View>

            <View className="flex-row items-center justify-between p-5 border-b border-zinc-800/50">
              <View className="flex-row items-center">
                <View className="bg-zinc-800 w-12 h-12 rounded-2xl items-center justify-center">
                  <CreditCard color="#f59e0b" size={24} />
                </View>
                <View className="ml-4">
                  <Text className="text-zinc-100 font-bold text-base">Credit / Debit Card</Text>
                  <Text className="text-zinc-500 text-xs">Visa, Mastercard, RuPay</Text>
                </View>
              </View>
              <Switch 
                value={getConfigValue('PAYMENT_CARD')} 
                onValueChange={() => handleToggle('PAYMENT_CARD')} 
                trackColor={{ false: '#27272a', true: '#f59e0b' }}
                thumbColor="#fff"
              />
            </View>

            <View className="flex-row items-center justify-between p-5">
              <View className="flex-row items-center">
                <View className="bg-zinc-800 w-12 h-12 rounded-2xl items-center justify-center">
                  <Banknote color="#f59e0b" size={24} />
                </View>
                <View className="ml-4">
                  <Text className="text-zinc-100 font-bold text-base">Cash on Delivery</Text>
                  <Text className="text-zinc-500 text-xs">Payment upon arrival</Text>
                </View>
              </View>
              <Switch 
                value={getConfigValue('PAYMENT_COD')} 
                onValueChange={() => handleToggle('PAYMENT_COD')} 
                trackColor={{ false: '#27272a', true: '#f59e0b' }}
                thumbColor="#fff"
              />
            </View>

          </View>
        )}

        <View className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 mt-8">
          <Text className="text-amber-500/80 text-sm leading-5">
            💡 <Text className="font-bold">Pro-tip:</Text> Use these switches to manage order preferences during peak festival hours to avoid rush.
          </Text>
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
