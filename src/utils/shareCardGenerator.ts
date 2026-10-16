import { View } from 'react-native';
import { Habit, CleanTimeDuration } from '../data/types';
import { exportNativeImage } from './nativeImage';
export type ShareTemplateId = 'monumental' | 'certificate' | 'horizon' | 'story';
export type ShareBackgroundId = 'obsidian' | 'emerald' | 'violet' | 'zenSand' | 'amber';

export interface ShareCardRenderOptions {
  habit: Habit;
  cleanTime: CleanTimeDuration;
  longestStreak: number;
  moneySaved: number;
  hoursSaved: number;
  template: ShareTemplateId;
  background: ShareBackgroundId;
  includeQuote: boolean;
  includeStats: boolean;
  includeLiveTimer: boolean;
}

export interface BackgroundPalette {
  id: ShareBackgroundId;
  name: string;
  gradientTop: string;
  gradientBottom: string;
  accentColor: string;
  secondaryAccent: string;
  textColor: string;
  subtextColor: string;
  cardBorder: string;
  glowColor: string;
  isLight: boolean;
}

export const BACKGROUND_PALETTES: Record<ShareBackgroundId, BackgroundPalette> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Abyss',
    gradientTop: '#131317',
    gradientBottom: '#09090C',
    accentColor: '#A78BFA',
    secondaryAccent: '#60A5FA',
    textColor: '#FFFFFF',
    subtextColor: '#9CA3AF',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
    glowColor: 'rgba(167, 139, 250, 0.25)',
    isLight: false,
  },
  emerald: {
    id: 'emerald',
    name: 'Sanctuary Forest',
    gradientTop: '#08231E',
    gradientBottom: '#02100E',
    accentColor: '#34D399',
    secondaryAccent: '#FBBF24',
    textColor: '#F0FDF4',
    subtextColor: '#A7F3D0',
    cardBorder: 'rgba(52, 211, 153, 0.25)',
    glowColor: 'rgba(52, 211, 153, 0.28)',
    isLight: false,
  },
  violet: {
    id: 'violet',
    name: 'Twilight Aura',
    gradientTop: '#1E143B',
    gradientBottom: '#0D091B',
    accentColor: '#C084FC',
    secondaryAccent: '#F472B6',
    textColor: '#FAF5FF',
    subtextColor: '#D8B4FE',
    cardBorder: 'rgba(192, 132, 252, 0.28)',
    glowColor: 'rgba(192, 132, 252, 0.3)',
    isLight: false,
  },
  zenSand: {
    id: 'zenSand',
    name: 'Zen Ivory',
    gradientTop: '#F7F4EE',
    gradientBottom: '#EAE4D7',
    accentColor: '#4F46E5',
    secondaryAccent: '#D97706',
    textColor: '#1F2937',
    subtextColor: '#6B7280',
    cardBorder: 'rgba(31, 41, 55, 0.14)',
    glowColor: 'rgba(79, 70, 229, 0.15)',
    isLight: true,
  },
  amber: {
    id: 'amber',
    name: 'Solar Embers',
    gradientTop: '#281408',
    gradientBottom: '#140802',
    accentColor: '#F59E0B',
    secondaryAccent: '#EF4444',
    textColor: '#FFFBEB',
    subtextColor: '#FDE68A',
    cardBorder: 'rgba(245, 158, 11, 0.25)',
    glowColor: 'rgba(245, 158, 11, 0.28)',
    isLight: false,
  },
};

export const SHARE_TEMPLATES: { id: ShareTemplateId; name: string; tag: string }[] = [
  { id: 'monumental', name: 'Monumental', tag: 'Bold Streak' },
  { id: 'certificate', name: 'Certificate', tag: 'Sovereign Seal' },
  { id: 'horizon', name: 'Horizon', tag: 'Milestone Path' },
  { id: 'story', name: 'Story', tag: 'Your daily light' },
];


export async function exportAndShareCard(options: ShareCardRenderOptions, target: View | null, save=false) {
  await exportNativeImage(target, 'komorebi-streak.png', save, 1080);
  return { success: true, method: save ? 'file-save' : 'expo-sharing' };
}
