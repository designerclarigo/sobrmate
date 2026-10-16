/**
 * Local date handling utilities for Komorebi
 * Guarantees that local calendar days, today highlights, and ISO keys
 * match across all timezones without one-day UTC offsets.
 */

/**
 * Returns a YYYY-MM-DD string in local time
 */
export function getLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date at noon (12:00:00)
 * Setting hours to noon prevents any daylight saving or timezone boundary drift.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length < 3) return new Date(dateStr);
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return new Date(y, m, d, 12, 0, 0);
}

/**
 * Formats a YYYY-MM-DD string with full local weekday and date
 */
export function formatLocalDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  const dateObj = parseLocalDate(dateStr);
  return dateObj.toLocaleDateString(undefined, options);
}

/**
 * Safely formats hours number to 1 decimal place without floating-point errors
 */
export function formatHours(hours: number): string {
  if (!Number.isFinite(hours)) return '0.0';
  const rounded = Math.round(hours * 10) / 10;
  return rounded.toFixed(1);
}

/**
 * Pluralizes days or items cleanly
 */
export function formatDaysClean(days: number): string {
  return `${days} ${days === 1 ? 'day clean' : 'days clean'}`;
}
