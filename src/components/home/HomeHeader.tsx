import { useTheme, useThemedStyles } from '../../design-system/theme';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Text, colors } from '../../design-system';
import { BrandMark } from '../../onboarding/OnboardingIllustration';
import { Habit } from '../../data/types';
import { PremiumButton } from '../premium/PremiumButton';

export function HomeHeader({ habit, onChooseTracker, onNewTracker }: { habit: Habit | null; onChooseTracker: () => void; onNewTracker: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale > 1.2;
  const selector = <TouchableOpacity style={[styles.selector, stacked && styles.stackedSelector]} onPress={habit ? onChooseTracker : onNewTracker} activeOpacity={0.65} accessibilityRole="button" accessibilityLabel={habit ? `${habit.title}. Choose tracker` : 'Add your first tracker'}>
    <Text style={styles.habit} color="accent" numberOfLines={1}>{habit?.title || 'Alcohol'}</Text><ChevronDown size={12} strokeWidth={1.4} color={colors.accent.primary} />
  </TouchableOpacity>;

  return <View style={styles.container}><View style={[styles.content, stacked && { flexWrap: 'wrap' }]}>
    <View style={[styles.brand, stacked && { flex: 1 }]}><BrandMark size={26} /><Text weight="500" style={styles.brandName}>SobrMate</Text></View>
    {!stacked && selector}
    <PremiumButton />
    {stacked && selector}
  </View></View>;
}
const baseStyles = StyleSheet.create({
  container: { backgroundColor: colors.background.canvas, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  content: { width: '100%', maxWidth: 440, alignSelf: 'center', minHeight: 69, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 0 },
  brandName: { fontSize: 14, lineHeight: 20, letterSpacing: -0.2, flexShrink: 1 },
  selector: { flex: 1, minWidth: 0, minHeight: 44, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
  habit: { fontSize: 13, lineHeight: 18, flexShrink: 1 },
  stackedSelector: { flexBasis: '100%', minWidth: '100%', justifyContent: 'space-between', paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.background.subtle },
});
