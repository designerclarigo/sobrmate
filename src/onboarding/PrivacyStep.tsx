import { useTheme, useThemedStyles } from '../design-system/theme';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShieldCheck, Fingerprint, EyeOff, Sparkles } from 'lucide-react-native';
import { Text } from '../design-system/typography/Text';
import { colors } from '../design-system/tokens/colors';
import { spacing } from '../design-system/tokens/spacing';
import { radii } from '../design-system/tokens/radii';

interface PrivacyItem {
  icon: React.FC<{ size: number; color: string }>;
  title: string;
  desc: string;
}

const PRIVACY_ITEMS: PrivacyItem[] = [
  {
    icon: ({ size, color }) => <ShieldCheck size={size} color={color} strokeWidth={1.8} />,
    title: '100% On-Device Storage',
    desc: 'Your trackers and daily notes are saved right on this device. Nothing is uploaded to public servers.',
  },
  {
    icon: ({ size, color }) => <Fingerprint size={size} color={color} strokeWidth={1.8} />,
    title: 'Optional App Lock',
    desc: 'Protect your reflection logs with Face ID, Touch ID, or a PIN code whenever you step away.',
  },
  {
    icon: ({ size, color }) => <EyeOff size={size} color={color} strokeWidth={1.8} />,
    title: 'No Social Feeds or Ads',
    desc: 'No follower counts, comments, or competitive rankings. This is your personal space for quiet growth.',
  },
];

export const PrivacyStep: React.FC = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="subcaption" color="secondary" weight="500" style={styles.kicker}>
          YOUR DATA STAYS YOURS
        </Text>
        <Text variant="title1" color="primary" serif weight="400" style={styles.title}>
          Private and local-first.
        </Text>
        <Text variant="body" color="secondary" style={styles.description}>
          Habit change thrives in psychological safety. Everything you record in SobrMate remains entirely in your hands.
        </Text>
      </View>

      <View style={styles.cardList}>
        {PRIVACY_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <View key={index} style={styles.itemRow}>
              <View style={styles.iconWrapper}>
                <Icon size={20} color={colors.accent.primary} />
              </View>
              <View style={styles.itemContent}>
                <Text variant="bodyMedium" color="primary" weight="500">
                  {item.title}
                </Text>
                <Text variant="caption" color="secondary" style={styles.itemDesc}>
                  {item.desc}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.sealNote}>
        <Sparkles size={14} color={colors.accent.champagne} strokeWidth={2} />
        <Text variant="subcaption" color="secondary" weight="500" style={styles.sealText}>
          SECURED ON YOUR HARDWARE
        </Text>
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
  cardList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.accent.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemDesc: {
    marginTop: 2,
    lineHeight: 20,
  },
  sealNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  sealText: {
    letterSpacing: 0.8,
    fontSize: 13,
  },
});
