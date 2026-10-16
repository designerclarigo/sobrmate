import { useTheme, useThemedStyles } from '../../design-system/theme';
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from 'lucide-react-native';
import { Text, Card, colors, spacing, radii, shadows } from '../../design-system';
import { Habit, CheckIn } from '../../data/types';
import { triggerHaptic } from '../../utils/haptics';

interface TrackerCalendarPreviewProps {
  habit: Habit;
  checkIns: CheckIn[];
  onOpenCheckInForDate?: (dateStr: string) => void;
}

export const TrackerCalendarPreview: React.FC<TrackerCalendarPreviewProps> = ({
  habit,
  checkIns,
  onOpenCheckInForDate,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Current viewed month (defaults to current month)
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const quitDateObj = useMemo(() => new Date(habit.quitDate), [habit.quitDate]);

  // Habit check-ins map by date YYYY-MM-DD
  const habitCheckInsMap = useMemo(() => {
    const map = new Map<string, CheckIn>();
    checkIns
      .filter((c) => c.habitId === habit.id)
      .forEach((c) => {
        map.set(c.date, c);
      });
    return map;
  }, [checkIns, habit.id]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Compute calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday start: 0 for Monday ... 6 for Sunday
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isFuture: boolean;
      isBeforeQuit: boolean;
      isClean: boolean;
      checkIn?: CheckIn;
    }> = [];

    // Empty lead cells
    for (let i = 0; i < startDayIndex; i++) {
      days.push({
        dateStr: `prev-${i}`,
        dayNum: 0,
        isCurrentMonth: false,
        isToday: false,
        isFuture: false,
        isBeforeQuit: true,
        isClean: false,
      });
    }

    // Days in current month
    const todayY = today.getFullYear();
    const todayM = String(today.getMonth() + 1).padStart(2, '0');
    const todayD = String(today.getDate()).padStart(2, '0');
    const todayStr = `${todayY}-${todayM}-${todayD}`;
    const quitDateStr = habit.quitDate.split('T')[0];

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;
      const isBeforeQuit = dateStr < quitDateStr;

      const existingCheckIn = habitCheckInsMap.get(dateStr);
      const isClean =
        !isBeforeQuit &&
        !isFuture &&
        (!existingCheckIn || existingCheckIn.status === 'clean' || existingCheckIn.status === 'struggled');

      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday,
        isFuture,
        isBeforeQuit,
        isClean,
        checkIn: existingCheckIn,
      });
    }

    return days;
  }, [year, month, today, habit.quitDate, habitCheckInsMap]);

  // Statistics for this month
  const monthStats = useMemo(() => {
    let cleanCount = 0;
    let daysSinceQuitInMonth = 0;

    calendarDays.forEach((d) => {
      if (d.isCurrentMonth && !d.isFuture && !d.isBeforeQuit) {
        daysSinceQuitInMonth++;
        if (d.isClean) {
          cleanCount++;
        }
      }
    });

    return {
      cleanCount,
      totalCount: daysSinceQuitInMonth,
    };
  }, [calendarDays]);

  const handlePrevMonth = () => {
    triggerHaptic('light');
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    triggerHaptic('light');
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: typeof calendarDays[0]) => {
    if (!day.isCurrentMonth || day.isFuture) return;
    triggerHaptic('selection');
    setSelectedDateStr(day.dateStr);
    onOpenCheckInForDate?.(day.dateStr);
  };

  const weekHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const selectedDayInfo = useMemo(() => {
    if (!selectedDateStr) return null;
    return calendarDays.find((d) => d.dateStr === selectedDateStr);
  }, [selectedDateStr, calendarDays]);

  return (
    <Card variant="default" padding="base" style={styles.card}>
      {/* Month Navigation Row */}
      <View style={styles.navRow}>
        <View style={styles.titleWithIcon}>
          <CalendarIcon size={16} color={habit.accentColor || colors.accent.primary} />
          <Text variant="bodyMedium" color="primary" weight="500">
            {monthName}
          </Text>
        </View>

        <View style={styles.arrowsRow}>
          <TouchableOpacity
            onPress={handlePrevMonth}
            style={styles.arrowBtn}
            activeOpacity={0.7}
            accessibilityLabel="Previous month"
          >
            <ChevronLeft size={16} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNextMonth}
            style={styles.arrowBtn}
            activeOpacity={0.7}
            accessibilityLabel="Next month"
          >
            <ChevronRight size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday Labels Header */}
      <View style={styles.weekdaysRow}>
        {weekHeaders.map((w, idx) => (
          <View key={idx} style={styles.weekdayCell}>
            <Text variant="subcaption" color="tertiary" weight="500" align="center">
              {w}
            </Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {calendarDays.map((day, idx) => {
          if (!day.isCurrentMonth) {
            return <View key={`blank-${idx}`} style={styles.dayCell} />;
          }

          const hasCheckIn = !!day.checkIn;
          const isRelapsed = day.checkIn?.status === 'relapsed';
          const isStruggled = day.checkIn?.status === 'struggled';
          const isSelected = selectedDateStr === day.dateStr;

          return (
            <TouchableOpacity
              key={day.dateStr}
              onPress={() => handleSelectDay(day)}
              disabled={day.isFuture}
              activeOpacity={0.7}
              style={[
                styles.dayCell,
                day.isToday && styles.todayCell,
                isSelected && styles.selectedCell,
              ]}
            >
              <View
                style={[
                  styles.dayInner,
                  day.isClean && !day.isFuture && styles.cleanDayCircle,
                  isStruggled && styles.struggledDayCircle,
                  isRelapsed && styles.relapsedDayCircle,
                  day.isFuture && styles.futureDay,
                  day.isBeforeQuit && styles.beforeQuitDay,
                ]}
              >
                <Text
                  variant="caption"
                  color={
                    day.isFuture
                      ? 'tertiary'
                      : day.isBeforeQuit
                      ? 'tertiary'
                      : day.isClean
                      ? 'primary'
                      : 'primary'
                  }
                  weight={day.isToday || day.isClean ? '500' : '400'}
                  tabular
                  style={[
                    day.isFuture && { opacity: 0.35 },
                    day.isBeforeQuit && { opacity: 0.4 },
                  ]}
                >
                  {day.dayNum}
                </Text>

                {/* Micro status dot */}
                {day.isClean && !day.isFuture && !day.isBeforeQuit && (
                  <View
                    style={[
                      styles.cleanDot,
                      { backgroundColor: isStruggled ? colors.accent.amber : colors.accent.success },
                    ]}
                  />
                )}
                {isRelapsed && <View style={[styles.cleanDot, { backgroundColor: colors.accent.rose }]} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Day Info Card (if clicked) */}
      {selectedDayInfo && (
        <View style={styles.dayDetailBox}>
          <View style={styles.dayDetailHeader}>
            <Text variant="caption" color="secondary" weight="500">
              {new Date(selectedDayInfo.dateStr).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text
              variant="subcaption"
              color={
                selectedDayInfo.checkIn?.status === 'relapsed'
                  ? 'rose'
                  : selectedDayInfo.checkIn?.status === 'struggled'
                  ? 'amber'
                  : selectedDayInfo.isClean
                  ? 'success'
                  : 'secondary'
              }
              weight="500"
            >
              {selectedDayInfo.checkIn?.status === 'relapsed'
                ? 'Restart Recorded'
                : selectedDayInfo.checkIn?.status === 'struggled'
                ? 'Felt Urges • Held Fast'
                : selectedDayInfo.isClean
                ? 'Sovereign Clean'
                : 'Prior to Journey'}
            </Text>
          </View>
          {selectedDayInfo.checkIn?.reflection ? (
            <Text variant="caption" color="primary" style={styles.reflectionQuote}>
              “{selectedDayInfo.checkIn.reflection}”
            </Text>
          ) : null}
        </View>
      )}

      {/* Legend & Month Summary */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent.success }]} />
          <Text variant="subcaption" color="secondary">
            Clean Days
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent.amber }]} />
          <Text variant="subcaption" color="secondary">
            Struggled
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent.primary }]} />
          <Text variant="subcaption" color="secondary">
            Today
          </Text>
        </View>

        <Text variant="subcaption" color="tertiary" tabular style={{ marginLeft: 'auto' }}>
          {monthStats.cleanCount}/{monthStats.totalCount} Clean
        </Text>
      </View>
    </Card>
  );
};

const baseStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.surface,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.background.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: colors.accent.primary,
    borderRadius: radii.md,
  },
  selectedCell: {
    backgroundColor: colors.accent.primaryLight,
    borderRadius: radii.md,
  },
  dayInner: {
    width: '100%',
    height: '100%',
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cleanDayCircle: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  struggledDayCircle: {
    backgroundColor: colors.accent.amberLight,
  },
  relapsedDayCircle: {
    backgroundColor: colors.accent.roseLight,
  },
  futureDay: {
    opacity: 0.35,
  },
  beforeQuitDay: {
    opacity: 0.4,
  },
  cleanDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dayDetailBox: {
    backgroundColor: colors.background.subtle,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    marginTop: spacing.sm,
  },
  dayDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reflectionQuote: {
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
