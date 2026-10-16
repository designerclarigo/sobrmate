import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCleanTime, recordDailyCheckIn, removeHabit, validateHabit, RecoveryData } from '../src/data/recovery';
import { initialUserSettings } from '../src/data/initialData';
import { Habit } from '../src/data/types';
import { getLocalDateString } from '../src/utils/date';
import { decodeRecoveryData } from '../src/data/schema';
import { HABIT_CATALOG } from '../src/data/habitCatalog';
import { normalizeHabitCategory } from '../src/data/habitCategories';
const now = new Date('2026-10-12T00:20:00+05:30');
const habit: Habit = { id: 'test', title: 'A calmer evening', category: 'custom', quitDate: '2026-10-01T10:00:00Z', accentColor: '#7561A8', iconName: 'Leaf', pledge: 'Make room for rest', financialTracking: { enabled: true, costPerDay: 10, currency: '$' }, timeTracking: { enabled: true, hoursPerDaySaved: 1 }, longestStreakDays: 2, resetsCount: 0, createdAt: '2026-10-01T10:00:00Z' };
const makeData = (): RecoveryData => ({ habits: [{ ...habit }], activeHabitId: habit.id, checkIns: [], pledges: [{ habitId: habit.id, date: '2026-10-10' }], settings: initialUserSettings, hasCompletedOnboarding: true });
test('clean time is precise, handles invalid dates, and clamps future dates', () => {
  const duration = calculateCleanTime('2026-10-10T10:00:00Z', new Date('2026-10-12T12:34:56Z'));
  assert.deepEqual([duration.days, duration.hours, duration.minutes, duration.seconds], [2, 2, 34, 56]);
  assert.equal(calculateCleanTime('invalid', now).totalSeconds, 0);
  assert.equal(calculateCleanTime('2030-01-01', now).totalSeconds, 0);
});
test('today check-ins use local calendar dates and replace rather than duplicate', () => {
  const first = recordDailyCheckIn(makeData(), habit.id, 'clean', 1, ' First note ', now);
  assert.equal(first.checkIn.date, getLocalDateString(now));
  if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Calcutta' || Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata') assert.equal(first.checkIn.date, '2026-10-12');
  assert.equal(first.checkIn.reflection, 'First note');
  const next = recordDailyCheckIn(first.data, habit.id, 'struggled', 4, 'Still here', now);
  assert.equal(next.data.checkIns.length, 1);
  assert.equal(next.data.habits[0].quitDate, habit.quitDate);
});
test('a relapse resets once and preserves best streak and past entries', () => {
  const first = recordDailyCheckIn(makeData(), habit.id, 'relapsed', 5, 'A new start', now);
  assert.equal(first.data.habits[0].quitDate, now.toISOString());
  assert.equal(first.data.habits[0].longestStreakDays, calculateCleanTime(habit.quitDate, now).days);
  assert.equal(first.data.habits[0].resetsCount, 1);
  const update = recordDailyCheckIn(first.data, habit.id, 'relapsed', 4, 'Updated note', new Date(now.getTime() + 1000));
  assert.equal(update.data.habits[0].quitDate, now.toISOString());
  assert.equal(update.data.habits[0].resetsCount, 1);
});
test('historical journal edits preserve the live timer and reject future or invalid dates', () => {
  const past = recordDailyCheckIn(makeData(), habit.id, 'relapsed', 3, 'A past reflection', now, '2026-10-09');
  assert.equal(past.checkIn.date, '2026-10-09');
  assert.equal(past.data.habits[0].quitDate, habit.quitDate);
  assert.throws(() => recordDailyCheckIn(makeData(), habit.id, 'clean', 1, '', now, '2030-01-01'));
  assert.throws(() => recordDailyCheckIn(makeData(), habit.id, 'clean', 1, '', now, '2026-02-30'));
});
test('an explicitly confirmed restart can begin a new timer again on the same day', () => {
  const first = recordDailyCheckIn(makeData(), habit.id, 'relapsed', 5, '', now);
  const later = new Date(now.getTime() + 3600000);
  const second = recordDailyCheckIn(first.data, habit.id, 'relapsed', 5, '', later, undefined, true);
  assert.equal(second.data.habits[0].quitDate, later.toISOString()); assert.equal(second.data.habits[0].resetsCount, 2); assert.equal(second.data.checkIns.length, 1);
});
test('deleting the last tracker removes linked records and active selection', () => {
  const recorded = recordDailyCheckIn(makeData(), habit.id, 'clean', 1, '', now).data;
  const removed = removeHabit(recorded, habit.id);
  assert.equal(removed.habits.length, 0); assert.equal(removed.checkIns.length, 0); assert.equal(removed.pledges.length, 0); assert.equal(removed.activeHabitId, '');
});
test('tracker validation rejects empty names, invalid start dates, and impossible savings', () => {
  assert.doesNotThrow(() => validateHabit(habit, now));
  assert.throws(() => validateHabit({ ...habit, title: ' ' }, now));
  assert.throws(() => validateHabit({ ...habit, quitDate: '2030-01-01' }, now));
  assert.throws(() => validateHabit({ ...habit, financialTracking: { ...habit.financialTracking, costPerDay: -1 } }, now));
  assert.throws(() => validateHabit({ ...habit, timeTracking: { enabled: true, hoursPerDaySaved: 25 } }, now));
});
test('backup validation rejects malformed archives before replacing data', () => {
  assert.throws(() => decodeRecoveryData('broken JSON'));
  assert.throws(() => decodeRecoveryData(JSON.stringify({ unrelated: true })));
  const data = makeData();
  const decoded = decodeRecoveryData(JSON.stringify({ version: 2, data }));
  assert.equal(decoded.habits[0].id, habit.id);
  assert.equal(decoded.pledges.length, 1);
  assert.throws(() => decodeRecoveryData(JSON.stringify({ version: 2, data: { ...data, habits: [habit, habit] } })));
  assert.throws(() => decodeRecoveryData(JSON.stringify({ version: 2, data: { ...data, settings: { ...data.settings, reminderTime: '25:99' } } })));
});
test('legacy backups deduplicate journal entries and repair an orphaned active selection', () => {
  const first = recordDailyCheckIn(makeData(), habit.id, 'clean', 1, 'older', now).data;
  const entry = first.checkIns[0];
  const restored = decodeRecoveryData(JSON.stringify({ ...first, activeHabitId: 'missing', checkIns: [entry, { ...entry, timestamp: entry.timestamp + 1000, reflection: 'newer' }] }));
  assert.equal(restored.activeHabitId, habit.id); assert.equal(restored.checkIns.length, 1); assert.equal(restored.checkIns[0].reflection, 'newer');
});

test('every catalog habit uses a persistable category and survives archive reload', () => {
  const habits = HABIT_CATALOG.map(item => {
    const category = normalizeHabitCategory(item.category);
    assert.ok(category, `Missing category mapping for ${item.title}`);
    const created: Habit = { ...habit, id: item.id, title: item.title, category, iconName: item.iconName, accentColor: item.accentColor };
    validateHabit(created, now);
    return created;
  });
  const data = { ...makeData(), habits, activeHabitId: habits[0].id };
  const reloaded = decodeRecoveryData(JSON.stringify({ version: 2, data }));
  assert.deepEqual(reloaded.habits, habits);
  assert.equal(reloaded.activeHabitId, habits[0].id);
});

test('saved catalog category aliases are repaired without losing journal or intention data', () => {
  const data = recordDailyCheckIn(makeData(), habit.id, 'struggled', 3, 'Still making progress', now).data;
  const aliases = ['alcohol', 'nicotine', 'substances', 'behavioral'];
  for (const category of aliases) {
    const archive = { ...data, habits: [{ ...habit, category }] };
    const reloaded = decodeRecoveryData(JSON.stringify({ version: 2, data: archive }));
    assert.equal(reloaded.habits[0].category, category === 'behavioral' ? 'behavior' : 'substance');
    assert.equal(reloaded.habits[0].pledge, habit.pledge);
    assert.equal(reloaded.habits[0].quitDate, habit.quitDate);
    assert.deepEqual(reloaded.checkIns, data.checkIns);
    assert.deepEqual(reloaded.pledges, data.pledges);
  }
});

test('writes reject unmapped categories before storing a tracker', () => {
  assert.throws(() => validateHabit({ ...habit, category: 'alcohol' } as unknown as Habit, now), /valid habit category/);
  assert.throws(() => decodeRecoveryData(JSON.stringify({ ...makeData(), habits: [{ ...habit, category: 'unknown' }] })), /invalid tracker/);
  assert.equal(normalizeHabitCategory('__proto__'), null);
});
