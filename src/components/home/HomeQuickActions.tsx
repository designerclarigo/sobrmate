import React from 'react';
import { View } from 'react-native';
import { Trophy, Share2 } from 'lucide-react-native';
import { useResponsiveRow } from '../../utils/useResponsiveRow';
import { triggerHaptic } from '../../utils/haptics';
import { HomePressable } from './HomePressable';
import { HomePalette, HomeText as Text, useHomeAppearance, useHomeStyles } from './homeAppearance';

export function HomeQuickActions({ onShare, onMilestones }: { onShare: () => void; onMilestones: () => void }) {
  const palette = useHomeAppearance();
  const styles = useHomeStyles(makeStyles);
  const { stacked, onLayout } = useResponsiveRow(2, 130, 10);
  return <View onLayout={onLayout} style={[styles.row, stacked && styles.stacked]}>
    <HomePressable containerStyle={[styles.item, stacked && styles.fullWidth]} style={styles.button}
      hoverColor={palette.hover} onPress={onShare} accessibilityLabel="Share Streak">
      <Share2 size={15} strokeWidth={1.6} color={palette.precision} />
      <Text weight="500" style={styles.label}>Share Streak</Text>
    </HomePressable>
    <HomePressable containerStyle={[styles.item, stacked && styles.fullWidth]} style={styles.button}
      hoverColor={palette.hover} onPress={() => { triggerHaptic('light'); onMilestones(); }} accessibilityLabel="View Badges">
      <Trophy size={15} strokeWidth={1.6} color={palette.precision} />
      <Text weight="500" style={styles.label}>View Badges</Text>
    </HomePressable>
  </View>;
}
const makeStyles = (p: HomePalette) => ({
  row: { flexDirection: 'row' as const, alignItems: 'stretch' as const, gap: 10 },
  stacked: { flexDirection: 'column' as const },
  item: { flex: 1, minWidth: 0 },
  fullWidth: { flex: 0, width: '100%' as const },
  button: { minHeight: 44, flexGrow: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 14,
    borderWidth: 1, borderColor: p.border, backgroundColor: p.surface,
    flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 8 },
  label: { flexShrink: 1, fontSize: 12, lineHeight: 18, color: p.precision, textAlign: 'center' as const },
});
