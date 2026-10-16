import { useTheme, useThemedStyles } from '../theme';
import React, { useRef } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Animated,
  Platform,
} from 'react-native';
import { triggerHaptic } from '../../utils/haptics';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';
import { shadows } from '../tokens/shadows';
import { useReducedMotion } from '../../utils/useReducedMotion';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'subtle' | 'accent';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: keyof typeof spacing;
  accessibilityRole?: any;
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  onPress,
  padding = 'xl',
  accessibilityRole,
  accessibilityLabel,
}) => {
  const styles = useThemedStyles(baseStyles);

  const reducedMotion = useReducedMotion();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const cardStyles = [
    styles.base,
    styles[variant],
    { padding: spacing[padding] },
    style,
  ];

  if (onPress) {
    const handlePressIn = () => {
      if (reducedMotion) return;
      Animated.spring(scaleAnim, {
        toValue: 0.985,
        useNativeDriver: Platform.OS !== 'web',
        speed: 40,
        bounciness: 4,
      }).start();
    };

    const handlePressOut = () => {
      if (reducedMotion) return;
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: Platform.OS !== 'web',
        speed: 40,
        bounciness: 4,
      }).start();
    };

    const handlePress = () => {
      triggerHaptic('light');
      onPress();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole={accessibilityRole}
          accessibilityLabel={accessibilityLabel}
          style={cardStyles}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const baseStyles = StyleSheet.create({
  base: {
    borderRadius: radii.card, // 22px
    backgroundColor: colors.background.surface,
  },
  default: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadows.card,
  },
  elevated: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: 'rgba(26, 24, 22, 0.04)',
    ...shadows.elevated,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  subtle: {
    backgroundColor: colors.background.subtle,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  accent: {
    backgroundColor: colors.accent.primaryLight,
    borderWidth: 1,
    borderColor: colors.accent.primaryBorder,
  },
});
