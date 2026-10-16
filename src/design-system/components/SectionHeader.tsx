import { useTheme, useThemedStyles } from '../theme';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../typography/Text';
import { spacing } from '../tokens/spacing';

export interface SectionHeaderProps {
  title: string;
  kicker?: string;
  actionLabel?: string;
  onAction?: () => void;
  rightSlot?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  kicker,
  actionLabel,
  onAction,
  rightSlot,
}) => {
  const styles = useThemedStyles(baseStyles);

  return (
    <View style={styles.container}>
      <View style={styles.titleColumn}>
        {kicker && (
          <Text variant="subcaption" color="tertiary" weight="500" style={styles.kicker}>
            {kicker.toUpperCase()}
          </Text>
        )}
        <Text variant="title3" color="primary" weight="500">
          {title}
        </Text>
      </View>

      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7} style={styles.actionBtn}>
          <Text variant="caption" color="accent" weight="500">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : rightSlot ? (
        <View>{rightSlot}</View>
      ) : null}
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    marginTop: spacing.base,
  },
  titleColumn: {
    flex: 1,
  },
  kicker: {
    marginBottom: 2,
    letterSpacing: 1.1,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
});
