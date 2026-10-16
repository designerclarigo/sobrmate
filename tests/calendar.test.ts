import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALCOHOL_BANDS, calendarStatistics, getCheckInBand, getMonthDays, periodRange, yearLoggedRate } from '../src/utils/calendar';
import { recordDailyCheckIn, RecoveryData } from '../src/data/recovery';
import { CheckIn, Habit } from '../src/data/types';
import { initialUserSettings } from '../src/data/initialData';
import { decodeRecoveryData } from '../src/data/schema';
import { renderYearCardSvg } from '../src/utils/yearCard';
import { calendarBandCounts,referenceMonthDays } from '../src/utils/calendarLayout';

const habit:Habit = { id:'alcohol', title:'Alcohol', category:'substance', trackingMetric:'drinks', quitDate:'2026-10-01T12:00:00Z', createdAt:'2026-10-01T12:00:00Z', accentColor:'#7561A8', iconName:'GlassWater', pledge:'Be present', financialTracking:{ enabled:true, costPerDay:16, currency:'$' }, timeTracking:{ enabled:true, hoursPerDaySaved:2.5 }, longestStreakDays:2, resetsCount:0 };
const data = ():RecoveryData => ({ habits:[habit], activeHabitId:habit.id, checkIns:[], pledges:[], settings:initialUserSettings, hasCompletedOnboarding:true });
const entry = (date:string, status:CheckIn['status'], drinks?:number, blackout=false):CheckIn => ({ id:date, habitId:habit.id, date, status, timestamp:1, ...(drinks !== undefined || blackout ? { consumption:{ drinks,blackout } } : {}) });
const now = new Date('2026-10-13T12:00:00');

test('month grids use Sunday-first real dates across year and leap-day boundaries', () => {
  const october=getMonthDays(2026,9);
  assert.equal(october[0].date,'2026-09-27');
  assert.equal(october.length,35);
  assert.equal(october.at(-1)?.date,'2026-10-31');
  assert.ok(getMonthDays(2024,1).some(day => day.date === '2024-02-29' && day.inMonth));
  assert.equal(getMonthDays(2027,0)[0].date,'2026-12-27');
});

test('drink bands honor each boundary and blackout overrides a known or unknown count', () => {
  for (const [count,band] of [[0,0],[1,1],[2,1],[3,2],[5,2],[6,3],[100,3]]) assert.equal(getCheckInBand(entry('2026-10-13',count ? 'relapsed' : 'clean',count),true).id,ALCOHOL_BANDS[band].id);
  assert.equal(getCheckInBand(entry('2026-10-13','relapsed',1,true),true).id,'blackout');
  assert.equal(getCheckInBand(entry('2026-10-13','relapsed',undefined,true),true).id,'blackout');
  assert.equal(getCheckInBand(entry('2026-10-13','relapsed'),true).id,'used');
  assert.equal(getCheckInBand(entry('2026-10-13','struggled'),true).id,'clean');
});

test('statistics never infer clean days or counts from gaps, resets, or another tracker', () => {
  const entries=[entry('2026-10-10','clean',0),entry('2026-10-12','struggled',0),entry('2026-10-13','relapsed',4),entry('2026-10-09','relapsed'),entry('2026-10-08','relapsed',undefined,true),{ ...entry('2026-10-11','clean',0),habitId:'other' },entry('2026-10-14','clean',0)];
  const stats=calendarStatistics(entries,habit,'2026-10-01','2026-10-31','2026-10-13');
  assert.equal(stats.logged,5); assert.equal(stats.zeroDays,2); assert.equal(stats.zeroRate,40);
  assert.equal(stats.knownDrinks,4); assert.equal(stats.unknownCounts,2);
  assert.equal(stats.moneySaved,32); assert.equal(stats.hoursSaved,5); assert.equal(stats.bestStreak,1); assert.equal(stats.recordedStreak,0);
  const empty=calendarStatistics([],habit,'2026-10-01','2026-10-13','2026-10-13');
  assert.equal(empty.zeroDays,0); assert.equal(empty.zeroRate,null); assert.equal(empty.moneySaved,0);
});

test('periods clamp future dates and edits replace an earlier quantity', () => {
  assert.deepEqual(periodRange('week',2026,9,'2026-10-13','2026-10-13'),{ start:'2026-10-11',end:'2026-10-13' });
  assert.deepEqual(periodRange('week',2026,10,'2026-11-01','2026-10-13'),{ start:'2026-11-01',end:'2026-11-07' });
  assert.deepEqual(periodRange('month',2026,8,'2026-10-13','2026-10-13'),{ start:'2026-09-01',end:'2026-09-30' });
  const before=entry('2026-10-12','relapsed',6);
  const after={ ...entry('2026-10-12','clean',0), timestamp:2 };
  const stats=calendarStatistics([before,after],habit,'2026-10-01','2026-10-13','2026-10-13');
  assert.equal(stats.logged,1); assert.equal(stats.knownDrinks,0); assert.equal(stats.zeroDays,1);
  assert.equal(yearLoggedRate(366,2024,'2026-10-13'),100);
});

test('quantities and memory gaps persist, while historical saves preserve the live timer', () => {
  const saved=recordDailyCheckIn(data(),habit.id,'relapsed',5,'private note',now,'2026-10-12',false,{ drinks:4,blackout:false });
  assert.equal(saved.data.habits[0].quitDate,habit.quitDate);
  const decoded=decodeRecoveryData(JSON.stringify({ version:2,data:saved.data }));
  assert.deepEqual(decoded.checkIns[0].consumption,{ drinks:4,blackout:false });
  const unknown=recordDailyCheckIn(saved.data,habit.id,'relapsed',5,'',now,'2026-10-11',false,{ blackout:true });
  assert.equal(decodeRecoveryData(JSON.stringify(unknown.data)).checkIns[0].consumption?.blackout,true);
});

test('invalid and contradictory quantities are rejected before writing or restoring', () => {
  for (const drinks of [-1,1.5,1001,NaN]) assert.throws(() => recordDailyCheckIn(data(),habit.id,'relapsed',5,'',now,undefined,false,{ drinks,blackout:false }));
  assert.throws(() => recordDailyCheckIn(data(),habit.id,'clean',1,'',now,undefined,false,{ drinks:4,blackout:false }));
  assert.throws(() => recordDailyCheckIn(data(),habit.id,'relapsed',5,'',now,undefined,false,{ blackout:false }));
  assert.throws(() => decodeRecoveryData(JSON.stringify({ ...data(),checkIns:[entry('2026-10-13','clean',4)] })));
});

test('year exports honor format and tracker privacy and exclude private reflections', () => {
  const options={ habit:{ ...habit,title:'Wine & <Rest>' }, entries:[{ ...entry('2026-10-12','clean',0),reflection:'private reflection secret' }],year:2026,today:'2026-10-13',format:'story' as const,includeTracker:true };
  const story=renderYearCardSvg(options);
  assert.ok(story.includes('height="1920"')); assert.ok(story.includes('Wine &amp; &lt;Rest&gt;'));
  assert.ok(!story.includes('private reflection secret')); assert.ok(!story.includes(habit.pledge));
  const post=renderYearCardSvg({ ...options,format:'post',includeTracker:false });
  assert.ok(post.includes('height="1350"')); assert.ok(!post.includes('Wine'));
  // Check actual date-cell bounds against the next row, in both export arrangements.
  const monthNames=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  for(const [svg,pairs] of [[post,[['MAY','SEPTEMBER'],['AUGUST','SEPTEMBER']]],[story,[['MAY','JULY'],['AUGUST','OCTOBER']]]] as const){
    for(const [month,next] of pairs){
      const start=svg.indexOf('>'+month+'</text>')+month.length+8;
      const end=Math.min(...monthNames.map(name=>svg.indexOf('>'+name+'</text>',start)).filter(index=>index>start));
      const rects=svg.slice(start,end);
      const bottom=Math.max(...[...rects.matchAll(/y="(\d+)"[^>]*height="(\d+)"/g)].map(match=>Number(match[1])+Number(match[2])));
      const nextY=Number(svg.match(new RegExp('<text[^>]*y="(\\d+)"[^>]*>'+next+'</text>'))?.[1]);
      assert.ok(Number.isFinite(bottom)&&Number.isFinite(nextY));
      assert.ok(bottom<=nextY-20, `${month} must not overlap ${next}`);
    }
  }
});

test('reference grids reserve a fifth February row without inventing records or losing six-week months',()=>{
  const baseline=getMonthDays(2026,1),reference=referenceMonthDays(2026,1);
  assert.equal(baseline.length,28);
  assert.equal(reference.length,35);
  assert.equal(reference.at(-1)?.date,'2026-03-07');
  assert.ok(reference.slice(28).every(day=>!day.inMonth));
  assert.equal(new Set(reference.map(day=>day.date)).size,35);
  assert.deepEqual(reference.slice(0,28),baseline);
  assert.equal(referenceMonthDays(2026,7).length,42);
  assert.equal(referenceMonthDays(2027,0)[0].date,'2026-12-27');
});

test('category breakdown counts latest saved days in the selected tracker and period only',()=>{
  const entries=[entry('2026-10-10','clean',0),entry('2026-10-11','struggled',0),entry('2026-10-12','relapsed',6),{...entry('2026-10-12','relapsed',4),timestamp:2},entry('2026-10-13','relapsed',undefined,true),entry('2026-10-09','relapsed'),entry('2026-10-14','clean',0),{...entry('2026-10-12','clean',0),habitId:'other'}];
  assert.deepEqual(calendarBandCounts(entries,habit,'2026-10-09','2026-10-31','2026-10-13'),{used:1,clean:2,moderate:1,blackout:1});
  assert.deepEqual(calendarBandCounts(entries,habit,'2026-10-12','2026-10-12','2026-10-13'),{moderate:1});
  assert.deepEqual(calendarBandCounts([],habit,'2026-10-01','2026-10-31','2026-10-13'),{});
});
