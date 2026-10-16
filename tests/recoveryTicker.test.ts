import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRecoveryTicker } from '../src/utils/recoveryTicker';

function host(start = new Date(2026, 9, 14, 14, 30, 0, 250).getTime()) {
  let time = start;
  const jobs = new Set<{ callback: () => void; at: number }>();
  const ticker = createRecoveryTicker({ now: () => time, schedule: (callback, delay) => {
    const job = { callback, at: time + delay }; jobs.add(job);
    return () => { jobs.delete(job); };
  } });
  return { ticker, jobs, now: () => time, jump: (next: number) => { time = next; }, fire: () => {
    assert.equal(jobs.size, 1); const job = [...jobs][0]; jobs.delete(job); time = job.at; job.callback();
  } };
}

test('day-only consumers sleep until local midnight and update the calendar date', () => {
  const h = host(); let updates = 0;
  const off = h.ticker.subscribe('day', () => updates++);
  const midnight = new Date(h.now()); midnight.setHours(24, 0, 0, 0);
  assert.equal([...h.jobs][0].at, midnight.getTime());
  assert.equal(updates, 0); h.fire();
  assert.equal(updates, 1); assert.equal(new Date(h.ticker.getDay()).getDate(), 15);
  off(); assert.equal(h.jobs.size, 0);
});

test('live counters share one timer and return to midnight cadence after leaving the dashboard', () => {
  const h = host(); let a = 0; let b = 0;
  const offDay = h.ticker.subscribe('day', () => {});
  const offA = h.ticker.subscribe('second', () => a++);
  const offB = h.ticker.subscribe('second', () => b++);
  assert.equal(h.jobs.size, 1); assert.equal([...h.jobs][0].at - h.now(), 750);
  h.fire(); assert.equal(a, 1); assert.equal(b, 1);
  offA(); h.fire(); assert.equal(a, 1); assert.equal(b, 2);
  offB(); const midnight = new Date(h.now()); midnight.setHours(24, 0, 0, 0);
  assert.equal([...h.jobs][0].at, midnight.getTime());
  offDay(); assert.equal(h.jobs.size, 0);
});

test('backgrounding stops work and resuming refreshes both snapshots immediately', () => {
  const h = host(); let days = 0; let seconds = 0;
  const offDay = h.ticker.subscribe('day', () => days++);
  const offSecond = h.ticker.subscribe('second', () => seconds++);
  h.ticker.setActive(false); assert.equal(h.jobs.size, 0);
  h.jump(h.now() + 3600000); h.ticker.setActive(true);
  assert.equal(days, 1); assert.equal(seconds, 1);
  assert.equal(h.ticker.getDay(), h.now()); assert.equal(h.ticker.getSecond(), h.now());
  assert.equal(h.jobs.size, 1); offSecond(); offDay(); assert.equal(h.jobs.size, 0);
});

test('listeners can unsubscribe during a tick without leaving a timer running', () => {
  const h = host(); let off = () => {};
  off = h.ticker.subscribe('second', () => off()); h.fire();
  assert.equal(h.jobs.size, 0);
});
