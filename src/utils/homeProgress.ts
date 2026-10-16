import { CheckIn } from '../data/types';
import { getLocalDateString, parseLocalDate } from './date';
// Retain the existing utility API for consumers across a development refresh.
export { formatReclaimedTime, formatSavedMoney } from './metrics';

/** Sunday-first calendar dates; local noon keeps weeks stable through DST changes. */
export function getWeekDates(today: string, offset = 0): string[] {
  const start = parseLocalDate(today);
  start.setDate(start.getDate() - start.getDay() + Math.min(0, Math.trunc(offset)) * 7);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return getLocalDateString(date);
  });
}

// Compare calendar days rather than elapsed milliseconds, including 23/25-hour days.
function dayNumber(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

/** Urge-only days still maintain a zero-use streak. Missing entries break logged streaks. */
export function getLoggedStreaks(checkIns: CheckIn[], habitId: string, today: string) {
  const byDate = new Map<string, CheckIn>();
  for (const entry of checkIns) {
    if (entry.habitId !== habitId || entry.date > today) continue;
    const previous = byDate.get(entry.date);
    if (!previous || previous.timestamp <= entry.timestamp) byDate.set(entry.date, entry);
  }
  const entries = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let run = 0;
  let previousDay = -Infinity;
  for (const entry of entries) {
    const day = dayNumber(entry.date);
    run = entry.status === 'relapsed' ? 0 : day === previousDay + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previousDay = day;
  }
  let current = 0;
  let date = parseLocalDate(today);
  // Keep yesterday's recorded streak until today's check-in is due.
  if (!byDate.has(today)) date.setDate(date.getDate() - 1);
  while (true) {
    const entry = byDate.get(getLocalDateString(date));
    if (!entry || entry.status === 'relapsed') break;
    current += 1;
    date.setDate(date.getDate() - 1);
  }
  return { current, best };
}

