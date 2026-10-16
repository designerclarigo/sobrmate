import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Heart, Leaf, Pencil, Target } from 'lucide-react-native';
import { Habit } from '../../data/types';
import { personalizedSupport } from '../../data/personalization';
import { HomePressable } from './HomePressable';
import { HomePalette, HomeText as Text, useHomeAppearance, useHomeStyles } from './homeAppearance';

export function IntentionsCard({ habit, onEdit }: { habit: Habit; onEdit: () => void }) {
  const palette = useHomeAppearance();
  const styles = useHomeStyles(makeStyles);

  const iconProps = { size: 16, color: palette.intentionIcon, strokeWidth: 1.6 };
  const rows = [
    { label: 'Your why', value: habit.pledge || 'Add your reason for beginning', icon: <Heart {...iconProps} /> },
    { label: 'Making room for', value: habit.improvements?.length ? habit.improvements.join(', ') : 'Choose what matters to you', icon: <Target {...iconProps} /> },
    { label: 'Your daily reminder', value: habit.mindset || 'One day at a time', icon: <Leaf {...iconProps} /> },
    ...(habit.personalization?[{label:'A gentle next step',value:personalizedSupport(habit.personalization),icon:<Heart {...iconProps}/>}]:[]),
  ];
  return <View style={styles.card}>
    <View style={styles.heading}><Text weight="500" style={styles.title}>Your intentions</Text><HomePressable style={styles.edit} onPress={onEdit} hoverColor={palette.hover} accessibilityLabel="Edit your intentions"><Pencil size={15} color={palette.muted} strokeWidth={1.6} /></HomePressable></View>
    <View style={styles.rows}>{rows.map(row => <View key={row.label} style={styles.row}><View style={styles.icon}>{row.icon}</View><View style={styles.copy}><Text style={styles.label} color="secondary">{row.label}</Text><Text variant="body" color="primary" style={styles.value}>{row.value}</Text></View></View>)}</View>
  </View>;
}

const makeStyles = (p: HomePalette) => StyleSheet.create({
  card: { backgroundColor: p.surface, borderWidth: 1, borderColor: p.border, borderRadius: 22, padding: 17 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  title: { flex:1, fontSize:14, lineHeight:21, letterSpacing:-0.25, color:p.heading },
  edit: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  rows: { gap: 15, paddingTop: 5, paddingBottom: 2 },
  row: { flexDirection: 'row', gap: 11 },
  icon: { paddingTop: 3 },
  copy: { flex: 1, gap: 4 },
  label: { fontSize: 12, lineHeight: 18 },
  value: { fontSize: 12, lineHeight: 20.4, color: p.intentionValue },
});
