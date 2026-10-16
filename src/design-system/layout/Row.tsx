import { useTheme, useThemedStyles } from '../theme';
import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';

interface RowProps extends ViewProps {
  justify?: ViewStyle['justifyContent'];
  align?: ViewStyle['alignItems'];
  gap?: number;
  wrap?: boolean;
  children: React.ReactNode;
}

export const Row: React.FC<RowProps> = ({
  justify = 'flex-start',
  align = 'center',
  gap,
  wrap = false,
  style,
  children,
  ...props
}) => {
  const styles = useThemedStyles(baseStyles);

  return (
    <View
      style={[
        styles.row,
        {
          justifyContent: justify,
          alignItems: align,
          flexWrap: wrap ? 'wrap' : 'nowrap',
          gap: gap !== undefined ? gap : 0,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const baseStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
