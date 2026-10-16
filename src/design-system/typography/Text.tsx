import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { typography, TypographyVariant } from '../tokens/typography';
import { resolveTextMetrics } from './resolveTextMetrics';
import { useTheme } from '../theme';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'muted'
  | 'accent'
  | 'success'
  | 'amber'
  | 'rose'
  | 'inverse';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
  tabular?: boolean;
  serif?: boolean;
  children?: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  align,
  weight,
  tabular = false,
  serif,
  style,
  children,
  ...props
}) => {
  const { colors }=useTheme();
  const colorMap:Record<TextColor,string>={ ...colors.text, amber:colors.accent.amber, rose:colors.accent.rose };
  const variantStyle = typography[variant];
  const textColor = colorMap[color];

  const combined:TextStyle=StyleSheet.flatten([variantStyle,style]);
  return (
    <RNText
      style={[
        styles.base,
        variantStyle,
        { color: textColor },
        align ? { textAlign: align } : undefined,
        tabular ? styles.tabular : undefined,
        style,
        resolveTextMetrics(combined, serif, weight),
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0,
    includeFontPadding: false,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
