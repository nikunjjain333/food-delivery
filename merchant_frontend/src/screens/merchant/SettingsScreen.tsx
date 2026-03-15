import { useEffect } from 'react';
import { View, Text, SafeAreaView, Switch, ActivityIndicator, ScrollView } from 'react-native';
import { useMerchantStore } from '../../store/useMerchantStore';
import { Wallet, CreditCard, Banknote } from 'lucide-react-native';
import { commonStyles, colors } from '../../utils/styles';

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
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Text style={{ fontSize: 30, fontWeight: '800', color: colors.primary, marginBottom: 8 }}>Settings</Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 32 }}>Manage store configurations</Text>

        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Payment Methods</Text>
        
        {loading && configs.length === 0 ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={[commonStyles.card, { borderRadius: 24, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }]}>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(39, 39, 42, 0.5)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: colors.border, width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet color={colors.primary} size={24} />
                </View>
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>UPI / Google Pay</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Direct bank transfer</Text>
                </View>
              </View>
              <Switch
                value={getConfigValue('PAYMENT_UPI')}
                onValueChange={() => handleToggle('PAYMENT_UPI')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(39, 39, 42, 0.5)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: colors.border, width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard color={colors.primary} size={24} />
                </View>
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Credit / Debit Card</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Visa, Mastercard, RuPay</Text>
                </View>
              </View>
              <Switch
                value={getConfigValue('PAYMENT_CARD')}
                onValueChange={() => handleToggle('PAYMENT_CARD')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: colors.border, width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                  <Banknote color={colors.primary} size={24} />
                </View>
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Cash on Delivery</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Payment upon arrival</Text>
                </View>
              </View>
              <Switch
                value={getConfigValue('PAYMENT_COD')}
                onValueChange={() => handleToggle('PAYMENT_COD')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

          </View>
        )}

        <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 16, padding: 16, marginTop: 32 }}>
          <Text style={{ color: 'rgba(245, 158, 11, 0.8)', fontSize: 14, lineHeight: 20 }}>
            💡 <Text style={{ fontWeight: 'bold' }}>Pro-tip:</Text> Use these switches to manage order preferences during peak festival hours to avoid rush.
          </Text>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
