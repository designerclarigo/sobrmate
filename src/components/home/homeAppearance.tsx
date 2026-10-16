import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text as NativeText, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { Text as AppText } from '../../design-system/typography/Text';
import type { TextProps } from '../../design-system/typography/Text';
import { typography } from '../../design-system/tokens/typography';
import { resolveTextMetrics } from '../../design-system/typography/resolveTextMetrics';
import { useTheme } from '../../design-system/theme';

/** Published Home reference, scoped here so Calendar and the app theme do not change. */
export const homeLight = {
  canvas: '#FAF9F6', surface: '#FFFFFF', ink: '#302B40', muted: '#75657F',
  brand: '#6755A5', eyebrow: '#8B779C', date: '#8D7D99', dateStrong: '#776685',
  caption: '#79658E', live: '#7C6A89', liveDot: '#91A994',
  counter: '#675280', counterUnit: '#8D79A1', clockValue: '#756085',
  clockLabel: '#75657F', precision: '#887097', mode: '#857095',
  gradient: ['#F3EEF8', '#ECE3F5'] as const,
  heroBorder: '#E7DDEE', orbit: '#FFFFFF70', tile: '#FFFFFF78',
  tileLast: '#FFFFFFA8', tileBorder: '#FFFFFF95', heroDivider: '#DED3E8',
  border: '#E8E2EB', headerBorder: '#EEE8EF', hover: '#F2EDF7',
  pledge: '#F4F0F8', pledgeBorder: '#E7DEED', pledgeIcon: '#E9E0F1',
  pledgeText: '#766083', pledgeArrow: '#8E76A5',
  pledgeDone: '#F0F4EF', pledgeDoneBorder: '#E0E8DB',
  pledgeDoneIcon: '#E4EBE0', pledgeDoneText: '#7E927D',
  statLabel: '#8A789A', streak: '#F3EFEF', streakBorder: '#EBE5EB',
  streakDivider: '#DFD6E6', streakValue: '#85708F', heading: '#675674',
  weekArrow: '#AD9ABA', today: '#AC96C2', future: '#CEBED8',
  weekDivider: '#F0EAF3', intentionIcon: '#AD94BB', intentionValue: '#817087',
  progressTrack: '#D9CCE5', progressFill: '#AD95C4',
  gold: '#806338', goldSurface: '#F4EEDFAA', goldBorder: '#E8DDC7',
  selector: '#937BA4', reset: '#90646D', resetBorder: '#ECDADD', resetSurface: '#FFFCFC',
  success: '#45866B', error: '#D95656', inverse: '#FFFFFF',
};
export type HomePalette = { [K in keyof typeof homeLight]: K extends 'gradient' ? readonly [string, string] : string };

export function useHomeAppearance(): HomePalette {
  const { colors, isDark } = useTheme();
  return useMemo(() => isDark ? {
    ...homeLight,
    canvas: colors.background.canvas, surface: colors.background.surface, ink: colors.text.primary,
    muted: colors.text.secondary, brand: colors.text.accent, eyebrow: colors.text.accent,
    date: colors.text.secondary, dateStrong: colors.text.primary, caption: colors.text.accent,
    live: colors.text.secondary, liveDot: colors.status.success, counter: colors.accent.primaryDark,
    counterUnit: colors.text.accent, clockValue: colors.text.accent, clockLabel: colors.text.secondary,
    precision: colors.text.secondary, mode: colors.text.accent,
    gradient: [colors.accent.primaryLight, colors.background.elevated] as const,
    heroBorder: colors.accent.primaryBorder, orbit: '#FFFFFF12', tile: '#FFFFFF08',
    tileLast: '#FFFFFF10', tileBorder: '#FFFFFF18', heroDivider: colors.accent.primaryBorder,
    border: colors.border.subtle, headerBorder: colors.border.subtle, hover: colors.background.muted,
    pledge: colors.accent.primaryLight, pledgeBorder: colors.accent.primaryBorder,
    pledgeIcon: colors.accent.primaryBorder, pledgeText: colors.text.accent, pledgeArrow: colors.text.accent,
    pledgeDone: colors.accent.successLight, pledgeDoneBorder: colors.accent.successBorder,
    pledgeDoneIcon: colors.accent.successBorder, pledgeDoneText: colors.status.success,
    statLabel: colors.text.secondary, streak: colors.background.subtle,
    streakBorder: colors.border.subtle, streakDivider: colors.border.medium, streakValue: colors.text.accent,
    heading: colors.text.primary, weekArrow: colors.text.accent, today: colors.accent.primary,
    future: colors.text.muted, weekDivider: colors.border.subtle,
    intentionIcon: colors.text.accent, intentionValue: colors.text.secondary,
    progressTrack: colors.accent.primaryBorder, progressFill: colors.accent.primary,
    gold: colors.accent.champagne, goldSurface: colors.accent.champagneLight, goldBorder: colors.accent.amberBorder,
    selector: colors.text.accent, reset: colors.accent.rose, resetBorder: colors.accent.roseBorder,
    resetSurface: colors.accent.roseLight, success: colors.status.success, error: colors.status.danger,
    inverse: colors.text.inverse,
  } : homeLight, [colors, isDark]);
}

export function useHomeStyles<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(factory: (palette: HomePalette) => T): T {
  const palette = useHomeAppearance();
  return useMemo(() => StyleSheet.create(factory(palette)), [factory, palette]);
}

/** Reuse loaded sans faces, metrics and scaling; Android has a native serif fallback. */
export function HomeText({ color = 'primary', variant = 'body', serif, weight, style, tabular, align, ...props }: TextProps) {
  const palette = useHomeAppearance();
  const colorMap = { primary: palette.ink, secondary: palette.muted, tertiary: palette.precision,
    muted: palette.date, accent: palette.caption, inverse: palette.inverse,
    success: palette.success, amber: palette.gold, rose: palette.error };
  if (serif || tabular) {
    const combined = StyleSheet.flatten([typography[variant], style]);
    const metrics = resolveTextMetrics(combined, serif, weight);
    // Standalone numbers use the reference's compact leading; body copy keeps app metrics.
    if (tabular && metrics.fontSize! >= 20 && combined.lineHeight) {
      metrics.lineHeight = Math.max(metrics.fontSize!, combined.lineHeight);
    }
    return <NativeText {...props} style={[{ includeFontPadding: false, color: colorMap[color] },
      typography[variant], style, metrics, align ? { textAlign: align } : undefined,
      tabular ? { fontVariant: ['tabular-nums'] } : undefined,
      serif ? { fontFamily: Platform.OS === 'android' ? 'serif' : 'Georgia' } : undefined]} />;
  }
  return <AppText {...props} color={color} variant={variant} serif={serif} weight={weight} align={align}
    style={[{ color: colorMap[color] }, style]} />;
}

export const homeShadows = {
  hero: { shadowColor: '#6755A5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.024,
    shadowRadius: 11, elevation: 0 } as ViewStyle,
  stat: { shadowColor: '#302B40', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.008,
    shadowRadius: 3.5, elevation: 0 } as ViewStyle,
};
