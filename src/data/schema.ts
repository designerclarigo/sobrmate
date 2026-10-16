import { RecoveryData, validateHabit } from './recovery';
import { initialUserSettings } from './initialData';
import { getLocalDateString } from '../utils/date';
import { normalizeHabitCategory } from './habitCategories';
import { Habit } from './types';
import { validateConsumption,validateQuantity } from './tracking';
import {validateSetupDraft} from './setupDraft';

export function decodeRecoveryData(raw: string): RecoveryData {
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error('This archive is not valid JSON. Your existing data has been kept.'); }
  const data: RecoveryData = parsed?.version === 2 ? parsed.data : parsed;
  if (!data || !Array.isArray(data.habits) || !Array.isArray(data.checkIns) || typeof data.settings !== 'object' || !data.settings) {
    throw new Error('This archive is not a SobrMate backup. Your existing data has been kept.');
  }
  if (data.habits.length > 1000 || data.checkIns.length > 100000) throw new Error('This archive exceeds the supported record limit.');
  const habits: Habit[] = [];
  for (const habit of data.habits) {
    const category = normalizeHabitCategory(habit?.category);
    if (!habit || typeof habit.id !== 'string' || !habit.id || habit.id.length > 120 || typeof habit.title !== 'string'
      || !category || !habit.financialTracking || !habit.timeTracking
      || typeof habit.pledge !== 'string' || typeof habit.iconName !== 'string' || typeof habit.accentColor !== 'string'
      || !Number.isFinite(habit.longestStreakDays) || habit.longestStreakDays < 0 || !Number.isFinite(habit.resetsCount) || habit.resetsCount < 0) {
      throw new Error('The archive contains an invalid tracker. Your existing data has been kept.');
    }
    const normalizedHabit = { ...habit, category, ...(String(habit.category) === 'alcohol' && habit.trackingMetric === undefined ? { trackingMetric: 'drinks' as const } : {}) };
    validateHabit(normalizedHabit);
    habits.push(normalizedHabit);
  }
  const ids = new Set(habits.map(h => h.id));
  if(data.onboardingStep!==undefined&&(!Number.isInteger(data.onboardingStep)||data.onboardingStep<0||data.onboardingStep>2))throw new Error('The saved welcome step is invalid.');
  if(data.hasCompletedSetup!==undefined&&typeof data.hasCompletedSetup!=='boolean')throw new Error('The saved setup completion is invalid.');
  if(data.setupDraft!==undefined)validateSetupDraft(data.setupDraft);
  if (ids.size !== habits.length) throw new Error('The archive contains duplicate tracker identifiers.');
  const validDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && getLocalDateString(new Date(`${date}T12:00:00`)) === date;
  for (const checkIn of data.checkIns) {
    if (!checkIn || !validDate(checkIn.date) || !['clean', 'struggled', 'relapsed'].includes(checkIn.status)
      || !Number.isFinite(checkIn.timestamp) || (checkIn.reflection !== undefined && typeof checkIn.reflection !== 'string')) {
      throw new Error('The archive contains an invalid journal entry. Your existing data has been kept.');
    }
    validateConsumption(checkIn.consumption, checkIn.status);
    const habit=habits.find(h=>h.id===checkIn.habitId);
    if(habit)validateQuantity(checkIn.quantity,checkIn.status,habit);
  }
  const settings = { ...initialUserSettings, ...data.settings };
  if (typeof settings.userName !== 'string' || typeof settings.userBio !== 'string'
    || typeof settings.userEmail!=='string' || !['light','dark','obsidian','slate'].includes(settings.theme)
    || !/^([01]\d|2[0-3]):[0-5]\d$/.test(settings.reminderTime)
    || (settings.pledgeReminderTime!==undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(settings.pledgeReminderTime))
    || typeof settings.hapticFeedback !== 'boolean' || typeof settings.notificationsEnabled !== 'boolean'
    || typeof settings.dailyReminderEnabled!=='boolean'||typeof settings.pledgeReminderEnabled!=='boolean'||typeof settings.widgetConfigured!=='boolean'
    || typeof settings.appLockEnabled !== 'boolean' || typeof settings.biometricEnabled !== 'boolean') {
    throw new Error('The archive contains invalid preferences. Your existing data has been kept.');
  }
  // Older archives may contain a reset and a daily entry for the same date.
  const seen = new Set<string>();
  const checkIns = [...data.checkIns].sort((a, b) => b.timestamp - a.timestamp).filter(c => {
    const key = `${c.habitId}:${c.date}`;
    if (!ids.has(c.habitId) || seen.has(key)) return false;
    seen.add(key); return true;
  });
  return { habits, checkIns, settings, hasCompletedOnboarding: data.hasCompletedOnboarding === true,
    ...(data.onboardingStep!==undefined?{onboardingStep:data.onboardingStep}:{}),
    ...(data.hasCompletedSetup!==undefined?{hasCompletedSetup:data.hasCompletedSetup}:{}),
    ...(data.setupDraft!==undefined?{setupDraft:data.setupDraft}:{}),
    activeHabitId: ids.has(data.activeHabitId) ? data.activeHabitId : habits[0]?.id ?? '',
    pledges: Array.isArray(data.pledges) ? data.pledges.filter(p => p && ids.has(p.habitId) && validDate(p.date)) : [] };
}
