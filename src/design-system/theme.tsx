import React, { createContext, useContext, useMemo } from 'react';
import { colors as lightColors, darkColors, ColorTokens } from './tokens/colors';
import { useRecoveryStore } from '../data/store';

const ThemeContext=createContext({ colors:lightColors as ColorTokens, isDark:false });
export function ThemeProvider({ children }:{ children:React.ReactNode }) {
  const { settings }=useRecoveryStore();
  const isDark=settings.theme !== 'light';
  const value=useMemo(() => ({ colors:isDark ? darkColors : lightColors, isDark }),[isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() { return useContext(ThemeContext); }

/** Opt-in palette for a single screen subtree; surrounding app appearance is unchanged. */
export function ThemeScope({ colors, children }:{ colors:ColorTokens; children:React.ReactNode }) {
  const { isDark } = useTheme();
  const value=useMemo(() => ({ colors, isDark }),[colors,isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Resolve existing native StyleSheets through the same semantic palette. */
export function useThemedStyles<T extends Record<string,object>>(sheet:T):T {
  const { colors, isDark }=useTheme();
  return useMemo(() => {
    if (!isDark && colors === lightColors) return sheet;
    const lookup=new Map<string,string>();
    const textLookup=new Map<string,string>();const backgroundLookup=new Map<string,string>();const borderLookup=new Map<string,string>();
    for (const group of Object.keys(lightColors) as (keyof ColorTokens)[]) {
      for (const [key,value] of Object.entries(lightColors[group])) lookup.set(value.toLowerCase(),(colors[group] as Record<string,string>)[key]);
    }
    for(const [key,value] of Object.entries(lightColors.text))textLookup.set(value.toLowerCase(),(colors.text as Record<string,string>)[key]);
    for(const [key,value] of Object.entries(lightColors.background))backgroundLookup.set(value.toLowerCase(),(colors.background as Record<string,string>)[key]);
    for(const [key,value] of Object.entries(lightColors.border))borderLookup.set(value.toLowerCase(),(colors.border as Record<string,string>)[key]);
    const convert=(value:unknown,key=''):unknown => {
      if (Array.isArray(value)) return value.map(item => convert(item));
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name,item]) => [name,convert(item,name)]));
      if (typeof value !== 'string') return value;
      if ((value === '#FFFFFF' || value === '#FFF') && key === 'color') return colors.text.inverse;
      if ((value === '#FFFFFF' || value === '#FFF') && key === 'backgroundColor') return colors.background.surface;
      const semantic=key==='color'?textLookup:key==='backgroundColor'?backgroundLookup:key.toLowerCase().includes('border')&&key.endsWith('Color')?borderLookup:null;
      return semantic?.get(value.toLowerCase()) || lookup.get(value.toLowerCase()) || value;
    };
    return convert(sheet) as T;
  },[sheet,colors,isDark]);
}
