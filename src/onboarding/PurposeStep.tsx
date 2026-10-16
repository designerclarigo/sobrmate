import { useTheme, useThemedStyles } from '../design-system/theme';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Clock, DollarSign, Sunrise } from 'lucide-react-native';
import { Text } from '../design-system/typography/Text';
import { colors } from '../design-system/tokens/colors';
import { spacing } from '../design-system/tokens/spacing';
import { radii } from '../design-system/tokens/radii';

export const PurposeStep: React.FC = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const [seconds, setSeconds] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s + 1) % 60);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const secStr = seconds.toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="subcaption" color="secondary" weight="500" style={styles.kicker}>
          PROGRESS YOU CAN SEE
        </Text>
        <Text variant="title1" color="primary" serif weight="400" style={styles.title}>
          Every second counts.
        </Text>
        <Text variant="body" color="secondary" style={styles.description}>
          Watch your streak grow in real time. Seeing your days and hours accumulate turns daily patience into visible strength.
        </Text>
      </View>

      {/* Live Time Counter Card */}
      <View style={styles.timeCard}>
        <View style={styles.timeCardHeader}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text variant="subcaption" color="accent" weight="500" style={styles.liveText}>
              LIVE TIME TRACKER
            </Text>
          </View>
          <Clock size={16} color={colors.accent.primary} strokeWidth={2} />
        </View>

        {/* Counter Digits */}
        <View style={styles.counterRow}>
          <View style={styles.counterUnit}>
            <Text variant="display" color="primary" serif weight="400" tabular style={styles.digitNumber}>
              14
            </Text>
            <Text variant="subcaption" color="secondary" weight="500" style={styles.digitLabel}>
              DAYS
            </Text>
          </View>
          <Text variant="title2" color="secondary" style={styles.separator}>
            :
          </Text>
          <View style={styles.counterUnit}>
            <Text variant="display" color="primary" serif weight="400" tabular style={styles.digitNumber}>
              08
            </Text>
            <Text variant="subcaption" color="secondary" weight="500" style={styles.digitLabel}>
              HRS
            </Text>
          </View>
          <Text variant="title2" color="secondary" style={styles.separator}>
            :
          </Text>
          <View style={styles.counterUnit}>
            <Text variant="display" color="primary" serif weight="400" tabular style={styles.digitNumber}>
              32
            </Text>
            <Text variant="subcaption" color="secondary" weight="500" style={styles.digitLabel}>
              MINS
            </Text>
          </View>
          <Text variant="title2" color="secondary" style={styles.separator}>
            :
          </Text>
          <View style={styles.counterUnit}>
            <Text variant="display" color="accent" serif weight="400" tabular style={styles.digitNumber}>
              {secStr}
            </Text>
            <Text variant="subcaption" color="accent" weight="500" style={styles.digitLabel}>
              SECS
            </Text>
          </View>
        </View>

        {/* Milestone preview */}
        <View style={styles.milestoneNotice}>
          <Sunrise size={15} color={colors.accent.champagne} strokeWidth={2} />
          <Text variant="caption" color="secondary">
            Next Milestone: <Text variant="caption" color="primary" weight="500">30 Days (First Month)</Text>
          </Text>
        </View>
      </View>

      {/* Metrics Mini-Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: colors.accent.successLight }]}>
            <DollarSign size={16} color={colors.accent.success} strokeWidth={2.2} />
          </View>
          <View>
            <Text variant="caption" color="primary" weight="500">
              $210 Saved
            </Text>
            <Text variant="subcaption" color="secondary">
              In two weeks
            </Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: colors.accent.primaryLight }]}>
            <Clock size={16} color={colors.accent.primary} strokeWidth={2.2} />
          </View>
          <View>
            <Text variant="caption" color="primary" weight="500">
              28h Reclaimed
            </Text>
            <Text variant="subcaption" color="secondary">
              For what matters
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  header: {
    marginBottom: spacing.lg,
  },
  kicker: {
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  description: {
    lineHeight: 24,
  },
  timeCard: {
    backgroundColor: colors.background.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  timeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.primary,
  },
  liveText: {
    letterSpacing: 0.6,
    fontSize: 13,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  counterUnit: {
    alignItems: 'center',
  },
  digitNumber: {
    fontSize: 32,
    lineHeight: 38,
  },
  digitLabel: {
    marginTop: 2,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  separator: {
    paddingBottom: 16,
  },
  milestoneNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
