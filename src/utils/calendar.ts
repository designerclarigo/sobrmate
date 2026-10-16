import { CheckIn, Habit } from '../data/types';
import { getLocalDateString, parseLocalDate } from './date';
import { getLoggedStreaks, getWeekDates } from './homeProgress';

export type StatisticsPeriod = 'week' | 'month' | 'year' | 'all';
export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const ALCOHOL_BANDS = [
  { id: 'clean', label: 'Clean · Abstained', short: '0 drinks', color: '#45866B', background: '#EEF5F0' },
  { id: 'low', label: 'Low / Mild', short: '1–2 drinks', color: '#C69B45', background: '#FAF4E8' },
  { id: 'moderate', label: 'Moderate', short: '3–5 drinks', color: '#E58A38', background: '#FCF0E4' },
  { id: 'heavy', label: 'Heavy', short: '6+ drinks', color: '#D95656', background: '#FBECEC' },
  { id: 'blackout', label: 'Memory Gap / Blackout', short: 'Blackout', color: '#302B40', background: '#EFEDF1' },
] as const;
export const STATUS_BANDS = [
  { ...ALCOHOL_BANDS[0], short:'No use' },
  { id: 'urges', label: 'Urges, no use', short: 'Felt urges', color: '#887097', background: '#F5F0F7' },
  { id: 'used', label: 'Use recorded', short: 'Use recorded', color: '#D95656', background: '#FBECEC' },
] as const;

export function getCheckInBand(entry: CheckIn, alcohol: boolean) {
  if (alcohol && entry.consumption) {
    const { drinks = 0, blackout } = entry.consumption;
    return ALCOHOL_BANDS[blackout ? 4 : drinks >= 6 ? 3 : drinks >= 3 ? 2 : drinks > 0 ? 1 : 0];
  }
  if (alcohol && entry.status !== 'relapsed') return ALCOHOL_BANDS[0];
  return STATUS_BANDS[entry.status === 'relapsed' ? 2 : entry.status === 'struggled' ? 1 : 0];
}

export function latestCheckIns(entries: CheckIn[], habitId: string, today: string): CheckIn[] {
  const byDate = new Map<string, CheckIn>();
  for (const entry of entries) {
    if (entry.habitId !== habitId || entry.date > today) continue;
    const previous = byDate.get(entry.date);
    if (!previous || previous.timestamp <= entry.timestamp) byDate.set(entry.date, entry);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Full Sunday-first weeks, including real adjacent-month dates. */
export function getMonthDays(year: number, month: number) {
  const start = new Date(year, month, 1, 12);
  const leading = start.getDay();
  const count = Math.ceil((leading + new Date(year, month + 1, 0, 12).getDate()) / 7) * 7;
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(year, month, index - leading + 1, 12);
    return { date: getLocalDateString(date), day: date.getDate(), inMonth: date.getMonth() === month };
  });
}

export function periodRange(period: StatisticsPeriod, year: number, month: number, selectedDate: string, today: string) {
  if (period === 'all') return { start: '0000-01-01', end: today };
  if (period === 'week') {
    const dates = getWeekDates(selectedDate);
    return { start: dates[0], end: dates[0] > today || dates[6] < today ? dates[6] : today };
  }
  const start = getLocalDateString(new Date(year, period === 'year' ? 0 : month, 1, 12));
  const last = getLocalDateString(new Date(year, period === 'year' ? 12 : month + 1, 0, 12));
  return { start, end: last < today ? last : today };
}

export function calendarStatistics(entries: CheckIn[], habit: Habit, start: string, end: string, today: string) {
  const selected = latestCheckIns(entries, habit.id, today).filter(entry => entry.date >= start && entry.date <= end);
  const zeroDays = selected.filter(entry => entry.status !== 'relapsed').length;
  let knownDrinks = 0;
  let unknownCounts = 0;
  let knownQuantity=0;let unknownQuantities=0;
  for (const entry of selected) {
    if (entry.consumption?.drinks !== undefined) knownDrinks += entry.consumption.drinks;
    else if (entry.status === 'relapsed') unknownCounts += 1;
    if(entry.quantity!==undefined)knownQuantity+=entry.quantity;
    else if(entry.status==='relapsed')unknownQuantities+=1;
  }
  const streak = getLoggedStreaks(selected, habit.id, end);
  return {
    logged: selected.length, zeroDays, knownDrinks, unknownCounts,knownQuantity,unknownQuantities,
    zeroRate: selected.length ? Math.round(zeroDays / selected.length * 100) : null,
    bestStreak: streak.best, recordedStreak: streak.current,
    moneySaved: habit.financialTracking.enabled ? zeroDays * habit.financialTracking.costPerDay : 0,
    hoursSaved: habit.timeTracking.enabled ? zeroDays * habit.timeTracking.hoursPerDaySaved : 0,
  };
}

export function yearLoggedRate(logged: number, year: number, today: string) {
  const first = new Date(year, 0, 1, 12);
  const end = year < parseLocalDate(today).getFullYear() ? new Date(year, 11, 31, 12) : parseLocalDate(today);
  if (end < first) return 0;
  // Calendar-day arithmetic avoids daylight-saving effects.
  const day = (value: Date) => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  return Math.min(100, Math.round(logged / ((day(end) - day(first)) / 86400000 + 1) * 100));
}
