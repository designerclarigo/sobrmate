import { useTheme, useThemedStyles } from '../theme';
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';

interface DividerProps {
  vertical?: boolean;
  color?: string;
  marginVertical?: keyof typeof spacing;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  vertical = false,
  color = colors.border.subtle,
  marginVertical,
  style,
}) => {
  const styles = useThemedStyles(baseStyles);

  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: color },
        marginVertical ? { marginVertical: spacing[marginVertical] } : undefined,
        style,
      ]}
    />
  );
};

const baseStyles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});
