import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../design-system';
import { CheckIn, Habit } from '../../data/types';
import { isAlcoholTracker } from '../../data/tracking';
import { getCheckInBand } from '../../utils/calendar';
import { formatLocalDate, parseLocalDate } from '../../utils/date';
import { getWeekDates } from '../../utils/homeProgress';
import { triggerHaptic } from '../../utils/haptics';
import { HomePressable } from './HomePressable';
import { HomePalette, HomeText as Text, useHomeAppearance, useHomeStyles } from './homeAppearance';

interface WeekProgressCardProps {
  habit: Habit;
  today: string;
  entries: CheckIn[];
  onSelectDate: (date: string) => void;
  onFullView: () => void;
}
export function WeekProgressCard({ habit, today, entries, onSelectDate, onFullView }: WeekProgressCardProps) {
  const { colors } = useTheme();
  const palette = useHomeAppearance();
  const styles = useHomeStyles(makeStyles);
  const bandColors: Record<string, string> = { clean: colors.status.success, low: colors.status.warning,
    moderate: colors.status.orange, heavy: colors.status.danger, blackout: palette.ink,
    urges: colors.accent.primary, used: colors.status.danger };

  const [offset, setOffset] = useState(0);
  const dates = useMemo(() => getWeekDates(today, offset), [today, offset]);
  const byDate = useMemo(() => new Map(entries.map(entry => [entry.date, entry])), [entries]);
  const loggedDays = dates.filter(date => byDate.has(date) && byDate.get(date)?.status !== 'relapsed').length;
  const range = `${formatLocalDate(dates[0], { month: 'short', day: 'numeric' })} – ${formatLocalDate(dates[6], { month: 'short', day: 'numeric' })}`;
  const changeWeek = (amount: number) => {
    triggerHaptic('selection');
    setOffset(previous => Math.min(0, previous + amount));
  };
  return <View style={styles.card}>
    <View style={styles.heading}>
      <Text weight="500" style={styles.title}>Your week</Text>
      <HomePressable containerStyle={styles.linkContainer} style={styles.link} onPress={onFullView} hoverColor={palette.hover} accessibilityLabel="Open full calendar">
        <Text style={[styles.small, { flexShrink:1 }]} color="secondary">Full view</Text><ArrowRight size={13} strokeWidth={1.6} color={palette.muted} />
      </HomePressable>
    </View>
    <View style={styles.weekNavigation}>
      <HomePressable style={styles.weekArrow} hoverColor={palette.hover} onPress={() => changeWeek(-1)} accessibilityLabel="Previous week">
        <ChevronLeft size={16} strokeWidth={1.6} color={palette.weekArrow} />
      </HomePressable>
      <Text style={styles.range} color="secondary">{range}</Text>
      <HomePressable style={[styles.weekArrow, offset === 0 && styles.disabledArrow]} hoverColor={palette.hover} onPress={() => changeWeek(1)} disabled={offset === 0} accessibilityLabel="Next week" accessibilityState={{ disabled: offset === 0 }}>
        <ChevronRight size={16} strokeWidth={1.6} color={palette.weekArrow} />
      </HomePressable>
    </View>
    <View style={styles.dates}>
      {dates.map(date => {
        const entry = byDate.get(date);
        const isToday = date === today;
        const future = date > today;
        const band = entry && !future ? getCheckInBand(entry, isAlcoholTracker(habit)) : null;
        const day = parseLocalDate(date);
        return <TouchableOpacity key={date} style={styles.dateButton} disabled={future} onPress={() => { triggerHaptic('light'); onSelectDate(date); }} activeOpacity={0.6} accessibilityRole="button" accessibilityLabel={`${formatLocalDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}, ${band ? band.label : future ? 'Upcoming' : 'No check-in'}`} accessibilityState={{ selected: isToday, disabled: future }}>
          <Text style={styles.weekday} color="secondary">{day.toLocaleDateString(undefined, { weekday: 'narrow' })}</Text>
          <View style={[styles.dateCircle, isToday && styles.todayCircle]}><Text style={[styles.dateNumber, future && styles.futureNumber]} color={isToday ? 'inverse' : 'secondary'} weight="500">{day.getDate()}</Text></View>
          <View style={[styles.statusDot, band && styles.recordedDot, { backgroundColor: band ? bandColors[band.id] : 'transparent' }]} />
        </TouchableOpacity>;
      })}
    </View>
    <View style={styles.weekSummary}>
      <Text style={styles.small} color="accent">{loggedDays} clean days logged</Text>
      <Text style={styles.small} color="secondary">{loggedDays ? 'You’re on track' : 'Your story starts here'}</Text>
    </View>
  </View>;
}

const makeStyles = (p: HomePalette) => StyleSheet.create({
  card: { backgroundColor: p.surface, borderRadius: 22, borderWidth: 1, borderColor: p.border, padding: 17 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 },
  title: { flex:1, fontSize:14, lineHeight:21, letterSpacing:-0.25, color:p.heading },
  linkContainer: { maxWidth: '48%', minWidth: 0 },
  link: { flexDirection: 'row', alignItems: 'center', justifyContent:'flex-end', gap: 5, minHeight: 44, borderRadius: 12 },
  weekNavigation: { minHeight: 44, marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  disabledArrow: { opacity: 0.3 },
  range: { fontSize: 12, lineHeight: 18, flexShrink:1, textAlign:'center' },
  small: { fontSize: 12, lineHeight: 18 },
  dates: { flexDirection: 'row', gap:1 },
  dateButton: { flex: 1, minHeight: 72, alignItems: 'center', gap: 7 },
  futureNumber: { color: p.future },
  weekday: { fontSize: 12, lineHeight: 18 },
  dateCircle: { width: 29, minHeight: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  todayCircle: { backgroundColor: p.today },
  dateNumber: { fontSize: 12, lineHeight: 18 },
  statusDot: { width: 4, height: 4, borderRadius: 2 },
  recordedDot: { width:6, height:6, borderRadius:3 },
  weekSummary: { borderTopWidth: 1, borderTopColor: p.weekDivider, marginTop:14, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
});
