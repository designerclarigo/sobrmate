import { useTheme, useThemedStyles } from '../theme';
import React, { useRef, useState } from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
  View,
  Animated,
  Platform,
  TextStyle,
} from 'react-native';
import { triggerHaptic } from '../../utils/haptics';
import { Text } from '../typography/Text';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';
import { shadows } from '../tokens/shadows';
import { useReducedMotion } from '../../utils/useReducedMotion';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  keepEnabledWhileLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  contentAlignment?: 'center' | 'space-between';
  labelStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  keepEnabledWhileLoading = false,
  iconLeft,
  iconRight,
  style,
  fullWidth = false,
  contentAlignment = 'center',
  labelStyle,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const reducedMotion = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || (!keepEnabledWhileLoading && (loading || busy)) || reducedMotion) return;
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: Platform.OS !== 'web',
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || (!keepEnabledWhileLoading && (loading || busy)) || reducedMotion) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePress = async () => {
    if (disabled || loading || busy || pending.current) return;
    pending.current = true;
    triggerHaptic(variant === 'primary' ? 'medium' : 'light');
    setError('');
    try { const result = onPress?.(); if (result instanceof Promise) { setBusy(true); await result; } }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to complete this action. Please try again.'); }
    finally { pending.current = false; setBusy(false); scaleAnim.setValue(1); }
  };

  const getTextColor = () => {
    if (disabled) return 'muted';
    switch (variant) {
      case 'primary':
        return 'inverse';
      case 'danger':
        return 'rose';
      case 'success':
        return 'success';
      case 'ghost':
        return 'accent';
      case 'outline':
      case 'secondary':
      default:
        return 'primary';
    }
  };

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || (!keepEnabledWhileLoading && (loading || busy))}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: disabled || (!keepEnabledWhileLoading && (loading || busy)), busy: loading || busy }}
        style={[
          styles.base,
          styles[variant],
          styles[size],
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
      >
        {loading || busy ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? colors.text.inverse : colors.accent.primary}
          />
        ) : (
          <View style={[styles.contentRow, contentAlignment === 'space-between' && { width: '100%', justifyContent: 'space-between' }]}>
            {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
            <Text
              variant={size === 'sm' ? 'caption' : size === 'lg' ? 'bodyLarge' : 'bodyMedium'}
              color={getTextColor()}
              weight="600"
              style={[styles.label,labelStyle]}
            >
              {label}
            </Text>
            {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
          </View>
        )}
      </Pressable>
      {!!error && <Text color="rose" variant="caption" accessibilityRole="alert" style={{ marginTop: 8 }}>{error}</Text>}
    </Animated.View>
  );
};

const baseStyles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    maxWidth: '100%',
  },
  label: { flexShrink: 1, textAlign: 'center' },
  iconLeft: {
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  iconRight: {
    marginLeft: spacing.sm,
    flexShrink: 0,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },

  // Variants
  primary: {
    backgroundColor: colors.accent.primary,
    borderWidth: 1,
    borderColor: 'transparent',
    ...shadows.subtle,
  },
  secondary: {
    backgroundColor: colors.background.subtle,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  outline: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.medium,
    ...shadows.subtle,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  danger: {
    backgroundColor: colors.accent.roseLight,
    borderWidth: 1,
    borderColor: colors.accent.roseBorder,
  },
  success: {
    backgroundColor: colors.accent.successLight,
    borderWidth: 1,
    borderColor: colors.accent.successBorder,
  },

  // Sizes
  sm: {
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: spacing.base,
    borderRadius: radii.md,
  },
  md: {
    minHeight: 54,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
  },
  lg: {
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.xl,
  },
});
