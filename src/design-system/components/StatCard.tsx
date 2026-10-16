import { useTheme, useThemedStyles } from '../theme';
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Card } from './Card';
import { Text } from '../typography/Text';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';

export interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subtitle,
  icon,
  accentColor = colors.accent.primary,
  style,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  return (
    <Card
      style={[styles.card, style]}
      padding="base"
      onPress={onPress}
      variant="default"
    >
      <View style={styles.topRow}>
        <Text variant="subcaption" color="tertiary" weight="500" style={styles.label}>
          {label.toUpperCase()}
        </Text>
        {icon && (
          <View style={[styles.iconWrapper, { backgroundColor: colors.background.subtle }]}>
            {icon}
          </View>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text variant="tabularMetric" color="primary" weight="500" tabular>
          {value}
        </Text>
        {unit && (
          <Text variant="caption" color="secondary" style={styles.unit}>
            {unit}
          </Text>
        )}
      </View>

      {subtitle && (
        <Text variant="caption" color="tertiary" numberOfLines={1} style={styles.subtitle}>
          {subtitle}
        </Text>
      )}

      {/* Calm vertical accent notch */}
      <View style={[styles.leftAccent, { backgroundColor: accentColor }]} />
    </Card>
  );
};

const baseStyles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    letterSpacing: 0.8,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xxs,
  },
  unit: {
    marginLeft: 6,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  leftAccent: {
    position: 'absolute',
    top: 14,
    bottom: 14,
    left: 0,
    width: 3.5,
    borderRadius: 2,
  },
});
