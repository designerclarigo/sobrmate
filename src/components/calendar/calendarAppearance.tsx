import React, { useMemo } from 'react';
import { Platform, Text as NativeText, StyleSheet, TextStyle } from 'react-native';
import { calendarColors,calendarBandColors as lightBands } from '../../design-system/tokens/calendar';
import { ThemeScope, useTheme } from '../../design-system/theme';
import { Text as AppText, TextProps } from '../../design-system/typography/Text';
import { typography } from '../../design-system/tokens/typography';
import { resolveTextMetrics } from '../../design-system/typography/resolveTextMetrics';
import { Button, ButtonProps } from '../../design-system/components/Button';

export function CalendarAppearance({children}:{children:React.ReactNode}) {
  const theme=useTheme();
  return <ThemeScope colors={theme.isDark?theme.colors:calendarColors}>{children}</ThemeScope>;
}

export function useCalendarBands() {
  const {colors,isDark}=useTheme();
  return useMemo(()=>isDark?{
    clean:{color:colors.status.success,background:colors.accent.successLight,border:colors.accent.successBorder,text:colors.accent.successDark},
    low:{color:colors.status.warning,background:colors.accent.warningLight,border:colors.accent.amberBorder,text:colors.status.warning},
    moderate:{color:colors.status.orange,background:colors.accent.orangeLight,border:colors.accent.orange,text:colors.status.orange},
    heavy:{color:colors.status.danger,background:colors.accent.roseLight,border:colors.accent.roseBorder,text:colors.status.danger},
    blackout:{color:colors.text.primary,background:colors.background.muted,border:colors.border.medium,text:colors.text.primary},
    urges:{color:colors.accent.primary,background:colors.accent.primaryLight,border:colors.accent.primaryBorder,text:colors.text.accent},
    used:{color:colors.status.danger,background:colors.accent.roseLight,border:colors.accent.roseBorder,text:colors.status.danger},
  }:lightBands,[colors,isDark]);
}
export type CalendarBandId = keyof typeof lightBands;

/** Native serif/monospace equivalents, using existing loaded faces for normal copy. */
export function CalendarText({mono=false,serif,variant='body',weight,style,tabular,align,color='primary',...props}:TextProps&{mono?:boolean}) {
  const {colors}=useTheme();
  if(!serif&&!mono)return <AppText {...props} variant={variant} color={color} weight={weight} tabular={tabular} align={align} style={style}/>;
  const base:TextStyle=StyleSheet.flatten([typography[variant],style]);
  const metrics=resolveTextMetrics(base,serif,weight);
  const map={...colors.text,amber:colors.accent.amber,rose:colors.accent.rose};
  return <NativeText {...props} style={[typography[variant],{includeFontPadding:false,color:map[color]},style,metrics,
    {fontFamily:mono?Platform.select({ios:'Menlo',default:'monospace'}):Platform.select({android:'serif',default:'Georgia'}),
      fontWeight:mono?(weight??'500'):'normal'},tabular&&{fontVariant:['tabular-nums']},align&&{textAlign:align}]}/>;
}

export function CalendarButton(props:ButtonProps) {
  const {colors}=useTheme();
  return <Button {...props} size="sm" style={[{minHeight:46,borderRadius:16,paddingHorizontal:16,
    shadowOpacity:0,elevation:0},props.style]} labelStyle={[{fontSize:12,lineHeight:18},
      (props.variant==='outline'||props.variant==='ghost')&&{color:colors.accent.primary},props.labelStyle]}/>;
}
