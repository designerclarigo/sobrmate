import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Habit} from '../src/data/types';
import {standardMilestones} from '../src/data/initialData';
import {calculateMilestonesForHabit} from '../src/utils/milestones';
import {milestoneShareText} from '../src/utils/milestoneSharing';

const start=Date.parse('2026-10-13T08:35:17Z');
const habit:Habit={id:'milestone-audit',title:'Alcohol',category:'substance',trackingMetric:'drinks',quitDate:new Date(start).toISOString(),createdAt:new Date(start).toISOString(),accentColor:'#6755A5',iconName:'GlassWater',pledge:'Be present',financialTracking:{enabled:false,costPerDay:0,currency:'$'},timeTracking:{enabled:false,hoursPerDaySaved:0},longestStreakDays:0,resetsCount:0};

test('a milestone unlocks at its precise elapsed-day boundary and advances to the next goal',()=>{
 const before=calculateMilestonesForHabit(habit,new Date(start+86400000-1));
 assert.equal(before.unlockedCount,0);assert.equal(before.nextMilestone?.targetDays,1);
 const reached=calculateMilestonesForHabit(habit,new Date(start+86400000));
 assert.equal(reached.unlockedCount,1);assert.equal(reached.currentStreakDays,1);
 assert.equal(reached.unlocked[0].unlockedAt,new Date(start+86400000).toISOString());
 assert.equal(reached.nextMilestone?.targetDays,2);assert.equal(reached.nextMilestone?.isNext,true);
 assert.equal(reached.upcoming.filter(goal=>goal.isNext).length,1);
});

test('all 19 existing goals remain available and reach a complete, shareable earned state',()=>{
 const analysis=calculateMilestonesForHabit(habit,new Date(start+730*86400000));
 assert.equal(analysis.totalMilestones,19);assert.equal(analysis.unlockedCount,19);
 assert.equal(analysis.upcomingCount,0);assert.equal(analysis.percentUnlocked,100);assert.equal(analysis.nextMilestone,null);
 assert.deepEqual(analysis.unlocked.map(goal=>goal.id),standardMilestones.map(goal=>goal.id));
 assert.ok(analysis.unlocked.every(goal=>goal.achieved&&goal.unlockedAt&&goal.progressPercent===100));
});

test('inspection reflects the active tracker start date after a restart without mutating the catalog',()=>{
 const now=new Date(start+3*86400000),before=JSON.stringify(standardMilestones);
 const old=calculateMilestonesForHabit(habit,now),restarted=calculateMilestonesForHabit({...habit,quitDate:now.toISOString(),resetsCount:1},now);
 assert.equal(old.unlockedCount,3);assert.equal(restarted.unlockedCount,0);assert.equal(restarted.nextMilestone?.targetDays,1);
 assert.equal(restarted.nextMilestone?.expectedDate,new Date(now.getTime()+86400000).toISOString());
 assert.equal(JSON.stringify(standardMilestones),before);assert.equal(habit.resetsCount,0);
});

test('goal progress remains bounded for a future start and a partially completed day',()=>{
 const future=calculateMilestonesForHabit(habit,new Date(start-3600000));
 assert.equal(future.currentStreakDays,0);assert.equal(future.unlockedCount,0);assert.ok(future.upcoming.every(goal=>goal.progressPercent===0));
 const halfDay=calculateMilestonesForHabit(habit,new Date(start+43200000));
 assert.equal(halfDay.nextMilestone?.progressPercent,50);assert.equal(halfDay.unlockedCount,0);
 assert.ok(halfDay.upcoming.every(goal=>goal.expectedDateObj?.getTime()===start+goal.targetDays*86400000));
});

test('sharing all earned goals uses public achievement copy without exposing private tracker fields',()=>{
 const privateHabit:Habit={...habit,title:'Wine',pledge:'private-pledge',notes:'private-notes',mindset:'private-mindset',goal:'private-goal'};
 const snapshot=JSON.stringify(privateHabit),earned=calculateMilestonesForHabit(privateHabit,new Date(start+730*86400000)).unlocked;
 for(const milestone of earned){
  const text=milestoneShareText(privateHabit,milestone);
  assert.ok(text.includes('Wine journey with SobrMate!'));
  assert.ok(text.includes(milestone.affirmation.trim()));
  for(const secret of ['private-pledge','private-notes','private-mindset','private-goal'])assert.ok(!text.includes(secret));
 }
 assert.equal(JSON.stringify(privateHabit),snapshot);
});

test('shared milestone text handles blank affirmations and uses the reference duration label',()=>{
 const goal=standardMilestones.find(item=>item.targetDays===7)!;
 const text=milestoneShareText(habit,{...goal,affirmation:'  '});
 assert.equal(text,'I earned the 1 Week · 7 days milestone on my Alcohol journey with SobrMate!');
 assert.ok(!text.includes('“'));
});
