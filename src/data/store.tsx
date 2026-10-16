import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Crypto from 'expo-crypto';
import { AlcoholConsumption, Habit, CheckIn, CheckInStatus, Milestone, UserSettings, CleanTimeDuration } from './types';
import { storage, emptyRecoveryData } from './storage';
import { standardMilestones } from './initialData';
import { calculateCleanTime, recordDailyCheckIn, RecoveryData, removeHabit, validateHabit } from './recovery';
import { setHapticsEnabled } from '../utils/haptics';
import { getLocalDateString } from '../utils/date';
import { useRecoveryClock } from '../utils/recoveryClock';
import { clearPasscode } from '../utils/security';
import {TrackerSetupDraft,commitSetupHabit,trackerIdForDraft,withSetupDraft} from './setupDraft';
export { calculateCleanTime } from './recovery';

interface RecoveryStoreState extends RecoveryData {
  activeHabit: Habit | null; isLoading: boolean; loadError: string | null; operationError: string | null;
  retryLoad: () => Promise<void>; dismissError: () => void;
  cleanTime: CleanTimeDuration; moneySaved: number; hoursSaved: number; streakDays: number;
  milestones: Milestone[]; nextMilestone: Milestone | null; currentTime: Date;
  getHabitCleanTime: (date: string) => CleanTimeDuration;
  getHabitNextMilestone: (days: number) => Milestone | null;
  hasCompletedSetup:boolean;
  saveOnboardingStep:(step:0|1|2)=>Promise<void>;saveSetupDraft:(draft:TrackerSetupDraft|null)=>Promise<void>;
  completeOnboarding: () => Promise<void>; resetOnboarding: () => Promise<void>;
  setActiveHabitId: (id: string) => Promise<void>;
  addHabit: (data: Omit<Habit, 'id' | 'createdAt' | 'longestStreakDays' | 'resetsCount'>,draftId?:string) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>; updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  updateHabitPledge: (id: string, pledge: string) => Promise<void>; resetHabit: (id: string, reason?: string) => Promise<void>;
  recordCheckIn: (id: string, status: CheckInStatus, urge?: 1 | 2 | 3 | 4 | 5, reflection?: string, date?: string, consumption?: AlcoholConsumption, quantity?:number) => Promise<CheckIn>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  signOut: () => Promise<void>; deleteAccount: () => Promise<void>;
  pledgeToday: (id: string) => Promise<void>;
  restoreBackup: (backup: RecoveryData) => Promise<void>;
}
const Context = createContext<RecoveryStoreState | null>(null);
export function RecoveryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(emptyRecoveryData);
  const dataRef = useRef(data);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const currentTime = new Date();
  const retryLoad = useCallback(async () => {
    setLoading(true); setLoadError(null);
    try { const loaded = await storage.load(); dataRef.current = loaded; setData(loaded); }
    catch (error) { setLoadError(error instanceof Error ? error.message : 'Unable to open your saved journey. Please try again.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void retryLoad(); }, [retryLoad]);
  useEffect(() => { setHapticsEnabled(data.settings.hapticFeedback); }, [data.settings.hapticFeedback]);

  // Serialize mutations, then persist the entire transaction before publishing it.
  const transact = useCallback(<T,>(change: (previous: RecoveryData) => { next: RecoveryData; result: T }): Promise<T> => {
    const work = queue.current.then(async () => {
      try {
        const { next, result } = change(dataRef.current);
        await storage.save(next);
        dataRef.current = next; setData(next); setOperationError(null);
        return result;
      } catch (error) {
        setOperationError(error instanceof Error ? error.message : 'Could not save your changes. Please try again.');
        throw error;
      }
    });
    queue.current = work.catch(() => undefined);
    return work;
  }, []);
  const change = useCallback((fn: (previous: RecoveryData) => RecoveryData) => transact(previous => ({ next: fn(previous), result: undefined })), [transact]);
  const setActiveHabitId = useCallback((id: string) => change(previous => {
    if (!previous.habits.some(h => h.id === id)) throw new Error('This tracker no longer exists.');
    return { ...previous, activeHabitId: id };
  }), [change]);
  const addHabit = useCallback((input: Omit<Habit, 'id' | 'createdAt' | 'longestStreakDays' | 'resetsCount'>,draftId?:string) => transact(previous => {
    const existing=draftId?previous.habits.find(h=>h.id===trackerIdForDraft(draftId)):undefined;
    if(existing)return {next:previous,result:existing};
    const habit: Habit = { ...input, title: input.title.trim(), id: draftId?trackerIdForDraft(draftId):`habit-${Crypto.randomUUID()}`, createdAt: new Date().toISOString(),
      longestStreakDays: calculateCleanTime(input.quitDate).days, resetsCount: 0 };
    validateHabit(habit);
    return { next: commitSetupHabit(previous,habit,draftId), result: habit };
  }), [transact]);
  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => change(previous => {
    if (!previous.habits.some(h => h.id === id)) throw new Error('This tracker no longer exists.');
    return { ...previous, habits: previous.habits.map(h => {
      if (h.id !== id) return h;
      const updated = { ...h, ...updates, id: h.id, createdAt: h.createdAt };
      validateHabit(updated); return updated;
    }) };
  }), [change]);
  const recordCheckIn = useCallback((id: string, status: CheckInStatus, urge?: 1 | 2 | 3 | 4 | 5, reflection?: string, date?: string, consumption?: AlcoholConsumption, quantity?:number) => transact(previous => {
    const result = recordDailyCheckIn(previous, id, status, urge, reflection, new Date(), date, false, consumption, quantity);
    return { next: result.data, result: result.checkIn };
  }), [transact]);
  const resetHabit = useCallback((id: string, reason?: string) => transact(previous => {
    const result = recordDailyCheckIn(previous, id, 'relapsed', 5, reason, new Date(), undefined, true);
    return { next: result.data, result: undefined };
  }), [transact]);
  const deleteHabit = useCallback((id: string) => change(previous => removeHabit(previous, id)), [change]);
  const updateHabitPledge = useCallback((id: string, pledge: string) => updateHabit(id, { pledge }), [updateHabit]);
  const saveOnboardingStep=useCallback((step:0|1|2)=>change(previous=>({...previous,onboardingStep:step})),[change]);
  const saveSetupDraft=useCallback((draft:TrackerSetupDraft|null)=>change(previous=>withSetupDraft(previous,draft)),[change]);
  const completeOnboarding = useCallback(() => change(previous => ({ ...previous, hasCompletedOnboarding: true,onboardingStep:2 })), [change]);
  const resetOnboarding = useCallback(() => change(previous => ({ ...previous, hasCompletedOnboarding: false,onboardingStep:0 })), [change]);
  const updateSettings = useCallback((updates: Partial<UserSettings>) => change(previous => {
    if (updates.reminderTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(updates.reminderTime)) throw new Error('Enter a time in 24-hour format, such as 21:00.');
    if (updates.pledgeReminderTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(updates.pledgeReminderTime)) throw new Error('Enter a time in 24-hour format, such as 08:00.');
    return { ...previous, settings: { ...previous.settings, ...updates } };
  }), [change]);
  const signOut = useCallback(() => updateSettings({ userName: 'Mindful Traveler', userEmail: '', userBio: '', avatarUrl: '' }), [updateSettings]);
  const deleteAccount = useCallback(async () => {
    await change(() => emptyRecoveryData());
    try { await storage.removeLegacyData(); await clearPasscode(); }
    catch { setOperationError('Your current journey was erased, but some older device data could not be removed. Please try erasing again.'); throw new Error('Some older device data could not be removed. Please try erasing again.'); }
  }, [change]);
  const pledgeToday = useCallback((id: string) => change(previous => {
    if (!previous.habits.some(h => h.id === id)) throw new Error('This tracker no longer exists.');
    const date = getLocalDateString(new Date());
    return { ...previous, pledges: [...previous.pledges.filter(p => !(p.habitId === id && p.date === date)), { habitId: id, date }] };
  }), [change]);
  const restoreBackup = useCallback((backup: RecoveryData) => change(previous => ({ ...backup,
    settings: { ...backup.settings, appLockEnabled: previous.settings.appLockEnabled, biometricEnabled: previous.settings.biometricEnabled, pinCode: undefined },
  })), [change]);
  const activeHabit = data.habits.find(h => h.id === data.activeHabitId) ?? null;
  const cleanTime = calculateCleanTime(activeHabit?.quitDate ?? currentTime.toISOString(), currentTime);
  const milestones = useMemo(() => activeHabit ? standardMilestones.map(m => ({ ...m, achieved: cleanTime.days >= m.targetDays,
    unlockedAt: cleanTime.days >= m.targetDays ? new Date(Date.parse(activeHabit.quitDate) + m.targetDays * 86400000).toISOString() : undefined })) : [], [activeHabit, cleanTime.days]);
  const getHabitCleanTime = useCallback((date: string) => calculateCleanTime(date, currentTime), [currentTime]);
  const getHabitNextMilestone = useCallback((days: number) => standardMilestones.find(m => days < m.targetDays) ?? null, []);
  const value: RecoveryStoreState = { ...data,hasCompletedSetup:data.hasCompletedSetup===true||data.habits.length>0,saveOnboardingStep,saveSetupDraft, activeHabit, isLoading, loadError, operationError, retryLoad, dismissError: () => setOperationError(null),
    cleanTime, streakDays: cleanTime.days, currentTime, milestones, nextMilestone: milestones.find(m => !m.achieved) ?? null,
    moneySaved: activeHabit?.financialTracking.enabled ? Math.round(cleanTime.totalSeconds / 86400 * activeHabit.financialTracking.costPerDay * 100) / 100 : 0,
    hoursSaved: activeHabit?.timeTracking.enabled ? Math.round(cleanTime.totalSeconds / 86400 * activeHabit.timeTracking.hoursPerDaySaved * 10) / 10 : 0,
    getHabitCleanTime, getHabitNextMilestone, completeOnboarding, resetOnboarding, setActiveHabitId, addHabit, deleteHabit, updateHabit,
    updateHabitPledge, resetHabit, recordCheckIn, updateSettings, signOut, deleteAccount, pledgeToday, restoreBackup };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useRecoveryStore(cadence: 'second' | 'day' | false = false) {
  const value = useContext(Context);
  const tick = useRecoveryClock(cadence);
  const currentTime = useMemo(() => new Date(tick || Date.now()), [tick, value]);
  const getHabitCleanTime = useCallback((date: string) => calculateCleanTime(date, currentTime), [currentTime]);
  const habit = value?.activeHabit;
  const cleanTime = getHabitCleanTime(habit?.quitDate ?? currentTime.toISOString());
  const milestones = useMemo(() => habit ? standardMilestones.map(m => ({ ...m, achieved: cleanTime.days >= m.targetDays,
    unlockedAt: cleanTime.days >= m.targetDays ? new Date(Date.parse(habit.quitDate) + m.targetDays * 86400000).toISOString() : undefined })) : [], [habit, cleanTime.days]);
  if (!value) throw new Error('useRecoveryStore must be used inside RecoveryProvider');
  return { ...value, currentTime, getHabitCleanTime, cleanTime, streakDays: cleanTime.days, milestones, nextMilestone: milestones.find(m => !m.achieved) ?? null,
    moneySaved: value.activeHabit?.financialTracking.enabled ? Math.round(cleanTime.totalSeconds / 86400 * value.activeHabit.financialTracking.costPerDay * 100) / 100 : 0,
    hoursSaved: value.activeHabit?.timeTracking.enabled ? Math.round(cleanTime.totalSeconds / 86400 * value.activeHabit.timeTracking.hoursPerDaySaved * 10) / 10 : 0 };
}
