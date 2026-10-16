import type { RecoveryPersonalization } from './personalization';
export type HabitCategory =
  | 'substance'
  | 'digital'
  | 'behavior'
  | 'financial'
  | 'mindfulness'
  | 'custom';

export interface FinancialTracking {
  enabled: boolean;
  costPerDay: number;
  currency: string;
}

export interface TimeTracking {
  enabled: boolean;
  hoursPerDaySaved: number;
}

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  quitDate: string; // ISO string
  accentColor: string;
  iconName: string;
  pledge: string; // Personal "Why" affirmation
  financialTracking: FinancialTracking;
  timeTracking: TimeTracking;
  longestStreakDays: number;
  resetsCount: number;
  lastRelapseDate?: string;
  createdAt: string;
  improvements?: string[];
  mindset?: string;
  goal?: string;
  notes?: string;
  trackingMetric?: 'drinks' | 'count' | 'minutes' | 'status';
  trackingUnit?: string;
  personalization?: RecoveryPersonalization;
}

export type CheckInStatus = 'clean' | 'struggled' | 'relapsed';

export interface AlcoholConsumption {
  drinks?: number; // Unknown counts remain absent, including memory gaps.
  blackout: boolean;
}

export interface CheckIn {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: CheckInStatus;
  urgeLevel?: 1 | 2 | 3 | 4 | 5;
  reflection?: string;
  timestamp: number;
  consumption?: AlcoholConsumption;
  quantity?: number; // Habit-specific count or minutes; absent means unrecorded.
}

export interface Milestone {
  id: string;
  targetDays: number;
  timeLabel?: string;
  title: string;
  description: string;
  affirmation: string;
  iconName: string;
  achieved?: boolean;
  unlockedAt?: string;
  expectedDate?: string;
  daysRemaining?: number;
  progressPercent?: number;
}

export interface UserSettings {
  userName: string;
  userEmail: string;
  userBio: string;
  avatarUrl?: string;
  avatarIcon?: string;
  memberSince: string;
  isPremium: boolean;
  theme: 'light' | 'dark' | 'obsidian' | 'slate';
  currency: string;
  notificationsEnabled: boolean;
  dailyReminderEnabled: boolean;
  pledgeReminderEnabled: boolean;
  reminderTime: string;
  pledgeReminderTime?: string;
  zenMode: boolean; // extra minimal mode
  hapticFeedback: boolean;
  showResetButtonOnHome: boolean;
  widgetConfigured: boolean;
  appLockEnabled: boolean;
  biometricEnabled: boolean;
  pinCode?: string;
}

export interface CleanTimeDuration {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedDays: string;
  formattedTime: string;
}
