import { useTheme, useThemedStyles } from '../theme';
import React, { useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Animated,
  Platform,
} from 'react-native';
import { triggerHaptic } from '../../utils/haptics';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { useReducedMotion } from '../../utils/useReducedMotion';

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  variant?: 'filled' | 'ghost' | 'outline';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 44,
  variant = 'filled',
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  const styles = useThemedStyles(baseStyles);

  const reducedMotion = useReducedMotion();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || reducedMotion) return;
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: Platform.OS !== 'web',
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || reducedMotion) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    triggerHaptic('light');
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={[
          styles.base,
          {
            width: size,
            height: size,
            borderRadius: radii.full,
          },
          styles[variant],
          disabled && styles.disabled,
          style,
        ]}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
};

const baseStyles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: colors.background.subtle,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outline: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  disabled: {
    opacity: 0.4,
  },
});
