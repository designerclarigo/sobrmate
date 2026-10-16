import { useTheme, useThemedStyles } from '../theme';
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Card } from './Card';
import { ProgressRing } from './ProgressRing';
import { Text } from '../typography/Text';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';

export interface TrackerCardProps {
  days: number;
  timeString: string;
  progress: number; // 0 to 1
  accentColor?: string;
  nextMilestoneTitle?: string;
  nextMilestoneDays?: number;
  daysRemaining?: number;
  pledge?: string;
  startedDateText?: string;
  style?: StyleProp<ViewStyle>;
}

export const TrackerCard: React.FC<TrackerCardProps> = ({
  days,
  timeString,
  progress,
  accentColor = colors.accent.primary,
  nextMilestoneTitle,
  nextMilestoneDays,
  daysRemaining,
  pledge,
  startedDateText,
  style,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  return (
    <Card variant="default" padding="lg" style={[styles.card, style]}>
      {/* Top Kicker Row */}
      <View style={styles.topRow}>
        <View style={styles.kickerBadge}>
          <View style={[styles.kickerDot, { backgroundColor: accentColor }]} />
          <Text variant="subcaption" color="secondary" weight="500" style={styles.kickerText}>
            SOVEREIGN TIME
          </Text>
        </View>

        {startedDateText && (
          <Text variant="caption" color="tertiary">
            Since {startedDateText}
          </Text>
        )}
      </View>

      <View style={styles.ringContainer}>
        <ProgressRing
          size={186}
          strokeWidth={9}
          progress={progress}
          accentColor={accentColor}
          backgroundColor={colors.background.subtle}
        >
          <View style={styles.innerContent}>
            <Text variant="counter" color="primary" weight="400" align="center" tabular>
              {days}
            </Text>
            <Text
              variant="subcaption"
              color="tertiary"
              weight="500"
              align="center"
              style={styles.daysLabel}
            >
              DAYS CLEAN
            </Text>
            <Text
              variant="caption"
              color="accent"
              weight="500"
              align="center"
              tabular
              style={styles.tickerTime}
            >
              {timeString}
            </Text>
          </View>
        </ProgressRing>
      </View>

      {/* Next Milestone progress bar */}
      {nextMilestoneTitle && (
        <View style={styles.milestoneBlock}>
          <View style={styles.milestoneRow}>
            <Text variant="caption" color="secondary" weight="500">
              Next: {nextMilestoneTitle}
            </Text>
            {daysRemaining !== undefined && (
              <Text variant="subcaption" color="tertiary">
                {daysRemaining}d away
              </Text>
            )}
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(Math.min(Math.max(progress, 0), 1) * 100)}%`,
                  backgroundColor: accentColor,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Personal pledge */}
      {pledge ? (
        <View style={styles.pledgeBox}>
          <Text variant="caption" color="secondary" align="center" style={styles.pledgeText}>
            “{pledge}”
          </Text>
        </View>
      ) : null}
    </Card>
  );
};

const baseStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.surface,
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  kickerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.subtle,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.full,
    gap: 6,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  kickerText: {
    letterSpacing: 0.6,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysLabel: {
    letterSpacing: 1.2,
    marginTop: -2,
  },
  tickerTime: {
    marginTop: 4,
    letterSpacing: 0.5,
  },
  milestoneBlock: {
    backgroundColor: colors.background.subtle,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.base,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 5,
    backgroundColor: 'rgba(26, 24, 22, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pledgeBox: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  pledgeText: {
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
