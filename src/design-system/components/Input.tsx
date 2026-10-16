import { NativeTextInput as TextInput } from './NativeInput';
import { useTheme, useThemedStyles } from '../theme';
import React, { useState } from 'react';
import { View, TextInputProps, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { Text } from '../typography/Text';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  iconLeft,
  iconRight,
  containerStyle,
  inputStyle,
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="caption" color="secondary" weight="500" style={styles.label}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
          inputStyle,
        ]}
      >
        {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
        <TextInput
          accessibilityLabel={props.accessibilityLabel ?? label}
          style={styles.textInput}
          value={value}
          placeholderTextColor={colors.text.muted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
      </View>

      {error ? (
        <Text variant="subcaption" color="rose" style={styles.helperText}>
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="subcaption" color="tertiary" style={styles.helperText}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.subtle,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.base,
    minHeight: 54,
  },
  inputFocused: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.background.surface,
  },
  inputError: {
    borderColor: colors.accent.rose,
    backgroundColor: colors.accent.roseLight,
  },
  textInput: {
    ...typography.body,
    flex: 1,
    minHeight: 52,
    paddingVertical: 14,
    color: colors.text.primary,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  helperText: {
    marginTop: spacing.xs,
  },
});
