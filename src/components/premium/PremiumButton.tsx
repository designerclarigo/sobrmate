import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Crown } from 'lucide-react-native';
import { Text, useTheme } from '../../design-system';
import { usePremium } from '../../data/premium';
import { triggerHaptic } from '../../utils/haptics';

export function PremiumButton() {
  const { colors } = useTheme();
  const premium = usePremium();
  return <Pressable accessibilityRole="button" disabled={premium.isLoading}
    accessibilityLabel={premium.isPremium ? 'Manage Premium, development mock membership' : 'Explore Premium, development mock mode'}
    accessibilityState={{ disabled: premium.isLoading }}
    onPress={() => { triggerHaptic('light'); if (premium.isPremium) premium.openManagement(); else premium.openPaywall(); }}
    style={({ pressed }) => [styles.button, { backgroundColor: colors.accent.champagneLight, borderColor: colors.accent.amberBorder, opacity: pressed ? 0.75 : 1 }]}>
    <Crown size={15} strokeWidth={1.7} color={colors.accent.champagne} />
    <Text variant="subcaption" weight="500" style={styles.label}>PRO</Text>
  </Pressable>;
}
const styles = StyleSheet.create({ button: { minHeight: 44, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1,
  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0 }, label: { letterSpacing: 0.8 } });
