import { useTheme, useThemedStyles } from '../design-system/theme';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DollarSign, Hourglass, Sparkles } from 'lucide-react-native';
import { Text } from '../design-system/typography/Text';
import { Card } from '../design-system/components/Card';
import { colors } from '../design-system/tokens/colors';
import { spacing } from '../design-system/tokens/spacing';
import { radii } from '../design-system/tokens/radii';

export const BenefitsStep: React.FC = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text variant="subcaption" color="accent" weight="500" style={styles.kicker}>
          RECLAIMED LIVING
        </Text>
        <Text variant="title1" color="primary" weight="400" style={styles.title}>
          Measure What Truly Counts
        </Text>
        <Text variant="body" color="secondary" style={styles.description}>
          Every clean day compounds tangible freedom. Witness the quiet transformation across your finances and focus.
        </Text>
      </View>

      {/* Benefit Cards */}
      <View style={styles.benefitsList}>
        {/* Money */}
        <Card variant="default" padding="base" style={styles.benefitCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: colors.accent.primaryLight }]}>
              <DollarSign size={20} color={colors.accent.primary} />
            </View>
            <View style={styles.statGlimpse}>
              <Text variant="title3" color="primary" weight="500" tabular>
                +$600+
              </Text>
              <Text variant="subcaption" color="tertiary">
                AVG. MONTHLY SAVINGS
              </Text>
            </View>
          </View>
          <Text variant="bodyMedium" color="primary" weight="500" style={styles.benefitTitle}>
            Compounded Financial Freedom
          </Text>
          <Text variant="caption" color="secondary" style={styles.benefitBody}>
            Watch hard cash return to your savings, debt relief, or meaningful experiences.
          </Text>
        </Card>

        {/* Time */}
        <Card variant="default" padding="base" style={styles.benefitCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: colors.accent.successLight }]}>
              <Hourglass size={20} color={colors.accent.success} />
            </View>
            <View style={styles.statGlimpse}>
              <Text variant="title3" color="primary" weight="500" tabular>
                +60 hrs
              </Text>
              <Text variant="subcaption" color="tertiary">
                TIME RECLAIMED
              </Text>
            </View>
          </View>
          <Text variant="bodyMedium" color="primary" weight="500" style={styles.benefitTitle}>
            Restored Hours &amp; Presence
          </Text>
          <Text variant="caption" color="secondary" style={styles.benefitBody}>
            Hundreds of waking hours returned to your passions, deep sleep, and loved ones.
          </Text>
        </Card>
      </View>
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  headerBlock: {
    marginBottom: spacing.lg,
  },
  kicker: {
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  title: {
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: spacing.xs,
  },
  description: {
    lineHeight: 24,
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitCard: {
    backgroundColor: colors.background.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statGlimpse: {
    alignItems: 'flex-end',
  },
  benefitTitle: {
    marginBottom: 4,
  },
  benefitBody: {
    lineHeight: 20,
  },
});
