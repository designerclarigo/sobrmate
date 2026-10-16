import { useTheme, useThemedStyles } from '../theme';
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Text } from '../typography/Text';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  kicker,
  leftSlot,
  rightSlot,
  bordered = false,
  style,
}) => {
  const styles = useThemedStyles(baseStyles);

  return (
    <View style={[styles.container, bordered && styles.bordered, style]}>
      <View style={styles.leftZone}>
        {leftSlot}
        <View style={styles.titleColumn}>
          {kicker && (
            <Text variant="subcaption" color="tertiary" weight="500" style={styles.kicker}>
              {kicker.toUpperCase()}
            </Text>
          )}
          <Text variant="title2" color="primary" serif weight="400" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" color="secondary" numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightSlot && <View style={styles.rightZone}>{rightSlot}</View>}
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
    minHeight: 52,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    paddingBottom: spacing.base,
  },
  leftZone: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  kicker: {
    marginBottom: 2,
    letterSpacing: 1.2,
  },
  subtitle: {
    marginTop: 2,
  },
  rightZone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.base,
  },
});
