import { useTheme, useThemedStyles } from '../../design-system/theme';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ChevronRight,
  Droplets,
  Wind,
  Smartphone,
  Leaf,
  Zap,
  Flame,
  Award,
  DollarSign,
  Clock,
  Heart,
  ShieldCheck,
} from 'lucide-react-native';
import {
  Text,
  Card,
  colors,
  spacing,
  radii,
} from '../../design-system';
import { Habit } from '../../data/types';
import { useRecoveryStore } from '../../data/store';
import { triggerHaptic } from '../../utils/haptics';

interface ActiveTrackerCardProps {
  habit: Habit;
  onPress: () => void;
  isActive?: boolean;
  compact?: boolean;
}

export const ActiveTrackerCard: React.FC<ActiveTrackerCardProps> = ({
  habit,
  onPress,
  isActive = false,
  compact = false,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const { getHabitCleanTime, getHabitNextMilestone } = useRecoveryStore('second');

  const cleanTime = getHabitCleanTime(habit.quitDate);
  const streakDays = cleanTime.days;
  const nextMilestone = getHabitNextMilestone(streakDays);

  const targetDays = nextMilestone ? nextMilestone.targetDays : 365;
  const milestoneProgress = Math.min(streakDays / targetDays, 1);
  const daysRemaining = nextMilestone ? Math.max(0, nextMilestone.targetDays - streakDays) : 0;

  // Compounded values for this specific habit
  const moneySaved = habit.financialTracking.enabled
    ? Math.round((cleanTime.totalSeconds / 86400) * habit.financialTracking.costPerDay)
    : 0;

  const hoursSaved = habit.timeTracking.enabled
    ? Math.round((cleanTime.totalSeconds / 86400) * habit.timeTracking.hoursPerDaySaved * 10) / 10
    : 0;

  const renderIcon = (name: string, color: string, size = 20) => {
    const props = { size, color, strokeWidth: 1.8 };
    switch (name) {
      case 'GlassWater':
      case 'Droplets':
        return <Droplets {...props} />;
      case 'Wind':
        return <Wind {...props} />;
      case 'Smartphone':
        return <Smartphone {...props} />;
      case 'Leaf':
        return <Leaf {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'Heart':
        return <Heart {...props} />;
      default:
        return <ShieldCheck {...props} />;
    }
  };

  const handleCardPress = () => {
    triggerHaptic('light');
    onPress();
  };

  return (
    <Card
      variant="default"
      padding={compact ? 'md' : 'base'}
      style={[styles.card, compact && styles.cardCompact]}
      onPress={handleCardPress}
      accessibilityRole="button"
      accessibilityLabel={`Active tracker ${habit.title}, ${streakDays} days clean. Tap for tracker details.`}
    >
      {/* Top Header: Icon, Name, Category, Chevron */}
      <View style={[styles.topRow, compact && styles.topRowCompact]}>
        <View style={styles.topLeft}>
          <View style={[styles.iconBox, compact && styles.iconBoxCompact]}>
            {renderIcon(habit.iconName, colors.accent.primary, compact ? 18 : 20)}
          </View>
          <View style={styles.titleColumn}>
            <Text variant={compact ? 'bodyMedium' : 'title3'} color="primary" weight="500" numberOfLines={1}>
              {habit.title}
            </Text>
            <Text variant="subcaption" color="secondary" style={styles.categoryKicker}>
              Started {new Date(habit.quitDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>

        <View style={styles.topRight}>
          <ChevronRight size={18} color={colors.text.secondary} />
        </View>
      </View>

      {/* Main Counter & Live Ticking Display (Clean single layout without redundant ring) */}
      <View style={[styles.counterSection, compact && styles.counterSectionCompact]}>
        <View style={styles.daysStreakRow}>
          <Text variant="counter" color="primary" serif weight="400" tabular style={[styles.largeDaysNumber, compact && styles.largeDaysNumberCompact]}>
            {streakDays}
          </Text>
          <View style={styles.daysUnitBox}>
            <Text variant="bodyMedium" color="secondary" weight="500">
              {streakDays === 1 ? 'day clean' : 'days clean'}
            </Text>
          </View>
        </View>

        {/* Smaller ticking timer units */}
        <View style={styles.tickingBox}>
          <Text variant="subcaption" color="secondary" weight="500">
            TIME SINCE START
          </Text>
          <Text variant="caption" color="accent" weight="500" tabular style={styles.tickingText}>
            {cleanTime.formattedTime}
          </Text>
        </View>
      </View>

      {/* ONE clear next-milestone progress bar */}
      {nextMilestone && (
        <View style={[styles.milestoneBarContainer, compact && styles.milestoneBarContainerCompact]}>
          <View style={styles.milestoneLabelRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Award size={13} color={colors.accent.champagne} />
              <Text variant="caption" color="secondary" weight="500">
                Next: {nextMilestone.title} ({nextMilestone.targetDays}d)
              </Text>
            </View>
            <Text variant="subcaption" color="secondary" weight="500">
              {daysRemaining}d away · {Math.round(milestoneProgress * 100)}%
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.round(milestoneProgress * 100)}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Metrics Row (Compounded savings/time) */}
      <View style={[styles.footerRow, compact && styles.footerRowCompact]}>
        <View style={styles.compactMetrics}>
          {habit.financialTracking.enabled && (
            <View style={styles.metricChip}>
              <DollarSign size={13} color={colors.accent.success} strokeWidth={2.2} />
              <Text variant="caption" color="primary" weight="500" tabular>
                {habit.financialTracking.currency}{moneySaved} saved
              </Text>
            </View>
          )}

          {habit.timeTracking.enabled && (
            <View style={styles.metricChip}>
              <Clock size={13} color={colors.accent.primary} strokeWidth={2.2} />
              <Text variant="caption" color="primary" weight="500" tabular>
                {hoursSaved.toFixed(1)}h reclaimed
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const baseStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.accent.primaryLight, // Soft lavender hero surface
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(117, 97, 168, 0.22)', // Subtle hairline border
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  cardCompact: {
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  topRowCompact: {
    marginBottom: spacing.xs,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(117, 97, 168, 0.15)',
  },
  iconBoxCompact: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
  },
  titleColumn: {
    flex: 1,
  },
  categoryKicker: {
    marginTop: 2,
  },
  topRight: {
    paddingLeft: spacing.xs,
  },
  counterSection: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  counterSectionCompact: {
    paddingVertical: 0,
    marginBottom: 4,
  },
  daysStreakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  largeDaysNumber: {
    fontSize: 60,
    lineHeight: 66,
  },
  largeDaysNumberCompact: {
    fontSize: 48,
    lineHeight: 52,
  },
  daysUnitBox: {
    paddingBottom: 6,
  },
  tickingBox: {
    marginTop: 4,
    gap: 2,
  },
  tickingBoxCompact: {
    marginTop: 2,
  },
  tickingText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  milestoneBarContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  milestoneBarContainerCompact: {
    marginTop: 4,
    marginBottom: 4,
    padding: 6,
  },
  milestoneLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(117, 97, 168, 0.15)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accent.primary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  footerRowCompact: {
    marginTop: 2,
  },
  compactMetrics: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(117, 97, 168, 0.15)',
  },
});
