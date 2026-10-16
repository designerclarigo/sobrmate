import { useTheme, useThemedStyles } from '../design-system/theme';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ShieldCheck, Wind, Smartphone, Sparkles, Check } from 'lucide-react-native';
import { Text } from '../design-system/typography/Text';
import { colors } from '../design-system/tokens/colors';
import { spacing } from '../design-system/tokens/spacing';
import { radii } from '../design-system/tokens/radii';
import { triggerHaptic } from '../utils/haptics';

interface IntentionOption {
  id: string;
  title: string;
  desc: string;
  icon: React.FC<{ size: number; color: string }>;
}

const INTENTIONS: IntentionOption[] = [
  {
    id: 'habit-alcohol',
    title: 'Alcohol-Free',
    desc: 'Clear mornings, balanced energy & calm focus',
    icon: ({ size, color }) => <ShieldCheck size={size} color={color} strokeWidth={1.8} />,
  },
  {
    id: 'habit-nicotine',
    title: 'Nicotine & Vaping',
    desc: 'Deep breathing, calm nervous system & vitality',
    icon: ({ size, color }) => <Wind size={size} color={color} strokeWidth={1.8} />,
  },
  {
    id: 'habit-digital',
    title: 'Digital Balance',
    desc: 'Less screen time, restful sleep & reclaimed focus',
    icon: ({ size, color }) => <Smartphone size={size} color={color} strokeWidth={1.8} />,
  },
  {
    id: 'habit-custom',
    title: 'Custom Habit',
    desc: 'Any personal commitment you want to protect',
    icon: ({ size, color }) => <Sparkles size={size} color={color} strokeWidth={1.8} />,
  },
];

export const WelcomeStep: React.FC<{ selectedId?: string; onSelect?: (id: string) => void }> = ({ selectedId = 'habit-alcohol', onSelect }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);


  const handleSelect = (id: string) => {
    triggerHaptic('selection');
    onSelect?.(id);
  };

  return (
    <View style={styles.container}>
      {/* Editorial Header */}
      <View style={styles.header}>
        <Text variant="subcaption" color="secondary" weight="500" style={styles.kicker}>
          A GENTLE START
        </Text>
        <Text variant="title1" color="primary" serif weight="400" style={styles.title}>
          Begin with intention.
        </Text>
        <Text variant="body" color="secondary" style={styles.description}>
          Track your clean streak, reclaim your daily hours, and celebrate steady progress without pressure or noise.
        </Text>
      </View>

      {/* Intention Selector */}
      <View style={styles.intentionsBlock}>
        <Text variant="subcaption" color="secondary" weight="500" style={styles.blockTitle}>
          WHAT HABIT WOULD YOU LIKE TO CHANGE?
        </Text>

        <View style={styles.optionsList}>
          {INTENTIONS.map((item) => {
            const isSelected = selectedId === item.id;
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => handleSelect(item.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                accessibilityState={{ selected: isSelected }}
              >
                <View
                  style={[
                    styles.iconBox,
                    isSelected ? styles.iconBoxSelected : styles.iconBoxDefault,
                  ]}
                >
                  <Icon
                    size={20}
                    color={isSelected ? colors.accent.primary : colors.text.secondary}
                  />
                </View>

                <View style={styles.optionContent}>
                  <Text
                    variant="bodyMedium"
                    color="primary"
                    weight={isSelected ? '500' : '400'}
                  >
                    {item.title}
                  </Text>
                  <Text variant="caption" color="secondary" style={styles.optionDesc}>
                    {item.desc}
                  </Text>
                </View>

                <View
                  style={[
                    styles.checkRing,
                    isSelected && styles.checkRingSelected,
                  ]}
                >
                  {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={2.5} />}
                </View>
              </TouchableOpacity>
            );
          })}
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
  intentionsBlock: {
    marginTop: spacing.xs,
  },
  blockTitle: {
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  optionCardSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.primaryLight,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconBoxDefault: {
    backgroundColor: colors.background.canvas,
  },
  iconBoxSelected: {
    backgroundColor: colors.background.surface,
  },
  optionContent: {
    flex: 1,
  },
  optionDesc: {
    marginTop: 2,
    lineHeight: 20,
  },
  checkRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  checkRingSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
});
