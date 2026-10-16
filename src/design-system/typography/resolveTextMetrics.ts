import type { TextStyle } from 'react-native';
import { fontFamilies } from '../tokens/typography';

/** Select a loaded face once; Android must not synthesize a second weight. */
export function resolveTextMetrics(style: TextStyle, serif?: boolean, weight?: TextStyle['fontWeight']): TextStyle {
  const editorial = serif === true || (serif !== false && style.fontFamily === fontFamilies.serif);
  const value = weight ?? style.fontWeight ?? '400';
  const numericWeight = value === 'bold' ? 700 : value === 'normal' ? 400 : Number(value);
  const fontFamily = editorial ? fontFamilies.serif
    : numericWeight >= 700 ? fontFamilies.bold : numericWeight >= 600 ? fontFamilies.semibold : numericWeight >= 500 ? fontFamilies.medium : fontFamilies.sans;
  const fontSize = Math.max(12, style.fontSize ?? 15);
  return { fontFamily, fontWeight: 'normal', fontStyle: style.fontStyle,
    fontSize, lineHeight: Math.max(style.lineHeight ?? fontSize * 1.5, fontSize * (fontSize >= 28 ? 1.15 : 1.35)) };
}
