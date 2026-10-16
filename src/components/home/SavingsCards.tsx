import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Clock3, Wallet } from 'lucide-react-native';
import { Habit } from '../../data/types';
import { useRecoveryStore } from '../../data/store';
import { useHabitDuration } from '../../utils/useHabitDuration';
import { formatReclaimedTime, formatSavedMoney } from '../../utils/metrics';
import { useResponsiveRow } from '../../utils/useResponsiveRow';
import { HomePressable } from './HomePressable';
import { HomePalette, HomeText as Text, useHomeAppearance, useHomeStyles, homeShadows } from './homeAppearance';

export function SavingsCards({ habit, onConfigure }: { habit: Habit; onConfigure: () => void }) {
  const palette = useHomeAppearance();
  const styles = useHomeStyles(makeStyles);
  const { stacked, onLayout } = useResponsiveRow(2, 130, 10);
  const { checkIns } = useRecoveryStore('day');

  const days = useHabitDuration(habit.quitDate).totalSeconds / 86400;
  const zeroUseDays = new Set(checkIns.filter(entry => entry.habitId === habit.id && entry.status !== 'relapsed').map(entry => entry.date)).size;
  const money = habit.financialTracking;
  const time = habit.timeTracking;
  return <View onLayout={onLayout} style={[styles.row,stacked&&{flexDirection:'column'}]}>
    <HomePressable containerStyle={[styles.item,stacked&&styles.fullWidth]} style={styles.card} onPress={onConfigure} hoverColor={palette.hover} accessibilityLabel="Money saved. Edit your daily estimate">
      <View style={styles.labelRow}><Wallet size={15} color={palette.statLabel} strokeWidth={1.6} /><Text style={styles.label}>Money saved</Text></View>
      <Text style={styles.value} color="primary" tabular adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.8}>{money.enabled ? formatSavedMoney(zeroUseDays * money.costPerDay, money.currency) : '—'}</Text>
      <Text style={styles.caption} color="secondary">{money.enabled ? `Based on ${zeroUseDays} logged zero-use ${zeroUseDays === 1 ? 'day' : 'days'}` : 'Add a daily estimate'}</Text>
    </HomePressable>
    <HomePressable containerStyle={[styles.item,stacked&&styles.fullWidth]} style={styles.card} onPress={onConfigure} hoverColor={palette.hover} accessibilityLabel="Time reclaimed. Edit your daily estimate">
      <View style={styles.labelRow}><Clock3 size={15} color={palette.statLabel} strokeWidth={1.6} /><Text style={styles.label}>Time reclaimed</Text></View>
      <Text style={styles.value} color="primary" tabular adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.8}>{time.enabled ? formatReclaimedTime(days * time.hoursPerDaySaved) : '—'}</Text>
      <Text style={styles.caption} color="secondary">{time.enabled ? 'Based on your daily estimate' : 'Make room for your time'}</Text>
    </HomePressable>
  </View>;
}

const makeStyles = (p: HomePalette) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  item: { flex: 1, minWidth: 0 },
  card: { flexGrow: 1, minWidth: 0, paddingHorizontal: 16, paddingVertical: 17, backgroundColor: p.surface, borderWidth: 1, borderColor: p.border, borderRadius: 20, ...homeShadows.stat },
  fullWidth: { flex:0, width:'100%' },
  labelRow: { flexDirection: 'row', gap: 7, alignItems: 'center', marginBottom: 12 },
  label: { flex:1, fontSize:12, lineHeight:17, color: p.statLabel },
  value: { fontSize: 24, lineHeight: 29, fontWeight: '500', letterSpacing: -0.8, color: p.counter },
  caption: { fontSize: 12, lineHeight: 18, marginTop: 7 },
});
