import { useTheme, useThemedStyles } from '../theme';
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { Text, TextColor } from '../typography/Text';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';

export type StatusChipTone = 'primary' | 'success' | 'amber' | 'rose' | 'subtle' | 'outline';

export interface StatusChipProps {
  label: string;
  tone?: StatusChipTone;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  tone = 'primary',
  icon,
  size = 'md',
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const getColors = (): { bg: string; border: string; text: TextColor } => {
    switch (tone) {
      case 'success':
        return {
          bg: colors.accent.successLight,
          border: colors.accent.successBorder,
          text: 'success',
        };
      case 'amber':
        return {
          bg: colors.accent.amberLight,
          border: colors.accent.amberBorder,
          text: 'amber',
        };
      case 'rose':
        return {
          bg: colors.accent.roseLight,
          border: colors.accent.roseBorder,
          text: 'rose',
        };
      case 'subtle':
        return {
          bg: colors.background.subtle,
          border: 'transparent',
          text: 'secondary',
        };
      case 'outline':
        return {
          bg: colors.background.surface,
          border: colors.border.medium,
          text: 'primary',
        };
      case 'primary':
      default:
        return {
          bg: colors.accent.primaryLight,
          border: colors.accent.primaryBorder,
          text: 'accent',
        };
    }
  };

  const { bg, border, text } = getColors();

  const chipContent = (
    <View
      style={[
        styles.chip,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: bg, borderColor: border },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        variant={size === 'sm' ? 'subcaption' : 'caption'}
        color={text}
        weight="500"
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {chipContent}
      </TouchableOpacity>
    );
  }

  return chipContent;
};

const baseStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.full,
  },
  sm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  md: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  icon: {
    marginRight: 4,
  },
});
