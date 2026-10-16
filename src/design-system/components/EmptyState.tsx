import { useTheme, useThemedStyles } from '../theme';
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../typography/Text';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const styles = useThemedStyles(baseStyles);

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconCircle}>{icon}</View>}
      <Text variant="title3" color="primary" align="center" weight="500" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" color="secondary" align="center" style={styles.description}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          variant="secondary"
          size="md"
          onPress={onAction}
          style={styles.action}
        />
      )}
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: colors.background.subtle,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    maxWidth: 290,
    lineHeight: 22,
    marginBottom: spacing.base,
  },
  action: {
    marginTop: spacing.xs,
  },
});
