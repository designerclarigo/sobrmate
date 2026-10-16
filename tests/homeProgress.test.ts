import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CheckIn } from '../src/data/types';
import { getLoggedStreaks, getWeekDates } from '../src/utils/homeProgress';
import { formatReclaimedTime, formatSavedMoney } from '../src/utils/metrics';

const entry = (date: string, status: CheckIn['status'] = 'clean', habitId = 'habit', timestamp = 1): CheckIn => ({ id: `${habitId}-${date}-${timestamp}`, date, status, habitId, timestamp });

test('weeks use local Sunday-first dates across month, leap-day, and year boundaries', () => {
  assert.deepEqual(getWeekDates('2026-10-12'), ['2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17']);
  assert.deepEqual(getWeekDates('2024-03-01'), ['2024-02-25', '2024-02-26', '2024-02-27', '2024-02-28', '2024-02-29', '2024-03-01', '2024-03-02']);
  assert.equal(getWeekDates('2026-01-01', -1)[0], '2025-12-21');
  assert.deepEqual(getWeekDates('2026-10-12', 1), getWeekDates('2026-10-12'));
});

test('logged streaks include urge-only days and keep yesterday until today is recorded', () => {
  const entries = [entry('2026-10-09'), entry('2026-10-10', 'struggled'), entry('2026-10-11')];
  assert.deepEqual(getLoggedStreaks(entries, 'habit', '2026-10-12'), { current: 3, best: 3 });
  assert.deepEqual(getLoggedStreaks([...entries, entry('2026-10-12', 'relapsed')], 'habit', '2026-10-12'), { current: 0, best: 3 });
  assert.deepEqual(getLoggedStreaks([...entries, entry('2026-10-12')], 'habit', '2026-10-12'), { current: 4, best: 4 });
});

test('missing days break logged streaks without losing the historical best', () => {
  const entries = [entry('2026-10-07'), entry('2026-10-08'), entry('2026-10-09'), entry('2026-10-11')];
  assert.deepEqual(getLoggedStreaks(entries, 'habit', '2026-10-12'), { current: 1, best: 3 });
  assert.deepEqual(getLoggedStreaks(entries, 'habit', '2026-10-13'), { current: 0, best: 3 });
});

test('streaks isolate trackers, ignore future entries, and honor the latest daily edit', () => {
  const entries = [entry('2026-10-11'), entry('2026-10-12'), entry('2026-10-12', 'relapsed', 'habit', 2), entry('2026-10-13'), entry('2026-10-10', 'clean', 'other')];
  assert.deepEqual(getLoggedStreaks(entries, 'habit', '2026-10-12'), { current: 0, best: 1 });
  assert.deepEqual(getLoggedStreaks([], 'habit', '2026-10-12'), { current: 0, best: 0 });
});

test('streaks remain consecutive over daylight-saving transitions', () => {
  const entries = [entry('2026-03-07'), entry('2026-03-08'), entry('2026-03-09')];
  assert.deepEqual(getLoggedStreaks(entries, 'habit', '2026-03-09'), { current: 3, best: 3 });
});

test('savings retain cents and the saved currency while reclaimed time has useful units', () => {
  assert.equal(formatSavedMoney(12.5, '$'), '$12.50');
  assert.equal(formatSavedMoney(-10, '$'), '$0.00');
  assert.match(formatSavedMoney(10, 'INR'), /10\.00/);
  assert.equal(formatReclaimedTime(0), '0 mins');
  assert.equal(formatReclaimedTime(1 / 60), '1 min');
  assert.equal(formatReclaimedTime(1), '1 hr');
  assert.equal(formatReclaimedTime(2.5), '2.5 hrs');
});
