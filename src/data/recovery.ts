import { AlcoholConsumption, CheckIn, CheckInStatus, CleanTimeDuration, Habit, UserSettings } from './types';
import { getLocalDateString } from '../utils/date';
import { HABIT_CATEGORIES } from './habitCategories';
import { validateConsumption,validateQuantity } from './tracking';
import { validatePersonalization } from './personalization';
import {TrackerSetupDraft} from './setupDraft';

export interface RecoveryData {
  habits: Habit[];
  activeHabitId: string;
  checkIns: CheckIn[];
  pledges: { habitId: string; date: string }[];
  settings: UserSettings;
  hasCompletedOnboarding: boolean;
  onboardingStep?:number;
  hasCompletedSetup?:boolean;
  setupDraft?:TrackerSetupDraft;
}

export function calculateCleanTime(quitDate: string, now = new Date()): CleanTimeDuration {
  const start = new Date(quitDate).getTime();
  const totalSeconds = Number.isFinite(start) ? Math.max(0, Math.floor((now.getTime() - start) / 1000)) : 0;
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { totalSeconds, days, hours, minutes, seconds, formattedDays: `${days}d`,
    formattedTime: [hours, minutes, seconds].map(n => String(n).padStart(2, '0')).join(':') };
}

export function validateHabit(habit: Habit, now = new Date()): void {
  if(habit.personalization!==undefined)validatePersonalization(habit.personalization);
  if (!HABIT_CATEGORIES.includes(habit.category)) throw new Error('Choose a valid habit category.');
  if (habit.trackingMetric !== undefined && !['drinks', 'status','count','minutes'].includes(habit.trackingMetric)) throw new Error('Choose a valid tracking metric.');
  if(habit.trackingUnit!==undefined&&(typeof habit.trackingUnit!=='string'||!habit.trackingUnit.trim()||habit.trackingUnit.length>30))throw new Error('Enter a tracking unit of 1–30 characters.');
  const timestamp = Date.parse(habit.quitDate);
  if (!habit.title.trim() || habit.title.length > 100) throw new Error('Enter a tracker name of 1–100 characters.');
  if (!Number.isFinite(timestamp) || timestamp > now.getTime()) throw new Error('Choose a valid start date that is not in the future.');
  const cost = habit.financialTracking.costPerDay;
  const hours = habit.timeTracking.hoursPerDaySaved;
  if (!Number.isFinite(cost) || cost < 0 || cost > 1000000) throw new Error('Enter a daily cost between 0 and 1,000,000.');
  if (!Number.isFinite(hours) || hours < 0 || hours > 24) throw new Error('Enter time saved between 0 and 24 hours per day.');
}

export function recordDailyCheckIn(data: RecoveryData, habitId: string, status: CheckInStatus,
  urgeLevel?: 1 | 2 | 3 | 4 | 5, reflection?: string, now = new Date(), selectedDate?: string, forceRestart = false,
  consumption?: AlcoholConsumption, quantity?:number): { data: RecoveryData; checkIn: CheckIn } {
  const habit = data.habits.find(h => h.id === habitId);
  if (!habit) throw new Error('This tracker no longer exists.');
  if (!['clean', 'struggled', 'relapsed'].includes(status)) throw new Error('Choose a check-in status.');
  validateConsumption(consumption, status);
  validateQuantity(quantity,status,habit);
  if (urgeLevel !== undefined && (!Number.isInteger(urgeLevel) || urgeLevel < 1 || urgeLevel > 5)) throw new Error('Choose an urge level from 1 to 5.');
  const today = getLocalDateString(now);
  const date = selectedDate ?? today;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today || getLocalDateString(new Date(`${date}T12:00:00`)) !== date) throw new Error('Choose a valid date up to today.');
  const previous = data.checkIns.find(c => c.habitId === habitId && c.date === date);
  const checkIn: CheckIn = { id: previous?.id ?? `checkin-${habitId}-${date}`, habitId, date, status,
    urgeLevel, reflection: reflection?.trim().slice(0, 10000), timestamp: now.getTime(), ...(consumption ? { consumption } : {}), ...(quantity!==undefined?{quantity}:{}) };
  // Editing today's relapse must not reset the clock a second time.
  const shouldReset = status === 'relapsed' && (previous?.status !== 'relapsed' || forceRestart) && date === today;
  const habits = shouldReset ? data.habits.map(h => h.id === habitId ? {
    ...h, quitDate: now.toISOString(), lastRelapseDate: now.toISOString(), resetsCount: h.resetsCount + 1,
    longestStreakDays: Math.max(h.longestStreakDays, calculateCleanTime(h.quitDate, now).days),
  } : h) : data.habits;
  return { data: { ...data, habits, checkIns: [checkIn, ...data.checkIns.filter(c => !(c.habitId === habitId && c.date === date))] }, checkIn };
}

export function removeHabit(data: RecoveryData, id: string): RecoveryData {
  const habits = data.habits.filter(h => h.id !== id);
  return { ...data, habits, checkIns: data.checkIns.filter(c => c.habitId !== id),
    pledges: data.pledges.filter(p => p.habitId !== id),
    activeHabitId: data.activeHabitId === id ? habits[0]?.id ?? '' : data.activeHabitId };
}
