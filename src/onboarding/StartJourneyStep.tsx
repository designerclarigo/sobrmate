import { useTheme, useThemedStyles } from '../design-system/theme';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Leaf, Bell, HeartHandshake } from 'lucide-react-native';
import { Text } from '../design-system/typography/Text';
import { colors } from '../design-system/tokens/colors';
import { spacing } from '../design-system/tokens/spacing';
import { radii } from '../design-system/tokens/radii';

export const StartJourneyStep: React.FC = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  return (
    <View style={styles.container}>
      {/* Visual Growth Halo */}
      <View style={styles.haloWrapper}>
        <View style={styles.outerGlow}>
          <View style={styles.innerEmblem}>
            <Leaf size={28} color={colors.accent.primary} strokeWidth={1.8} />
          </View>
        </View>
      </View>

      <View style={styles.header}>
        <Text variant="subcaption" color="secondary" weight="500" align="center" style={styles.kicker}>
          READY TO BEGIN
        </Text>
        <Text variant="title1" color="primary" serif weight="400" align="center" style={styles.title}>
          Take your first step.
        </Text>
        <Text variant="body" color="secondary" align="center" style={styles.description}>
          Commit to today. Set up your tracker with custom metrics, money savings, and a daily pledge.
        </Text>
      </View>

      {/* Gentle Affirmation Card */}
      <View style={styles.pledgeCard}>
        <View style={styles.pledgeHeader}>
          <HeartHandshake size={16} color={colors.accent.primary} strokeWidth={2} />
          <Text variant="subcaption" color="accent" weight="500" style={styles.pledgeKicker}>
            DAILY INTENTION
          </Text>
        </View>
        <Text variant="body" color="primary" serif style={styles.quoteText}>
          “Small disciplines repeated with consistency every day lead to lasting transformation.”
        </Text>
      </View>

      {/* Daily Reminder Pill */}
      <View style={styles.reminderCard}>
        <View style={styles.bellCircle}>
          <Bell size={16} color={colors.accent.champagne} strokeWidth={2} />
        </View>
        <View style={styles.reminderContent}>
          <Text variant="bodyMedium" color="primary" weight="500">
            A daily moment for yourself
          </Text>
          <Text variant="caption" color="secondary" style={styles.reminderSub}>
            Enable gentle reminders anytime in Settings
          </Text>
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
  haloWrapper: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  outerGlow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerEmblem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
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
    maxWidth: 320,
    alignSelf: 'center',
  },
  pledgeCard: {
    backgroundColor: colors.background.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  pledgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pledgeKicker: {
    letterSpacing: 0.6,
    fontSize: 13,
  },
  quoteText: {
    fontStyle: 'italic',
    lineHeight: 24,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  bellCircle: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: colors.accent.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderContent: {
    flex: 1,
  },
  reminderSub: {
    marginTop: 2,
  },
});
