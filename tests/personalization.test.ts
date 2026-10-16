import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyPersonalization,hasPersonalization,personalizedSupport,recoveryQuestions,validatePersonalization} from '../src/data/personalization';
import {decodeRecoveryData} from '../src/data/schema';
import {initialUserSettings} from '../src/data/initialData';
import {Habit} from '../src/data/types';
import {annualPlanSavings,formatPlanMoney,MOCK_PLANS,PREMIUM_SAVINGS} from '../src/data/entitlements';

test('questionnaire remains optional and only personalizes from actual choices',()=>{
  assert.equal(hasPersonalization(emptyPersonalization()),false);assert.equal(personalizedSupport(undefined),'');
  const answers={...emptyPersonalization(),motivation:recoveryQuestions[0].options[0],dailyChallenges:['Quiet evenings'],triggers:['Stress or difficult feelings'],recoveryGoal:recoveryQuestions[3].options[0]};validatePersonalization(answers);assert.equal(hasPersonalization(answers),true);assert.match(personalizedSupport(answers),/evening/);assert.match(personalizedSupport({...answers,dailyChallenges:[]}),/pause/);
});
test('invalid, duplicated, or forged questionnaire choices are rejected',()=>{
  for(const answers of [{...emptyPersonalization(),version:2},{...emptyPersonalization(),motivation:'forged'},{...emptyPersonalization(),triggers:['Boredom','Boredom']},{...emptyPersonalization(),dailyChallenges:null},{...emptyPersonalization(),recoveryGoal:123}])assert.throws(()=>validatePersonalization(answers as never));
});
test('old backups remain compatible and new questionnaire answers survive archive reload',()=>{
  const habit:Habit={id:'original',title:'My journey',category:'custom',quitDate:'2020-01-01T10:00:00Z',accentColor:'#6758B5',iconName:'Leaf',pledge:'One day at a time',financialTracking:{enabled:false,costPerDay:0,currency:'$'},timeTracking:{enabled:false,hoursPerDaySaved:0},longestStreakDays:0,resetsCount:0,createdAt:'2020-01-01T10:00:00Z'};
  const archive={version:2,data:{habits:[habit],activeHabitId:habit.id,checkIns:[],pledges:[],settings:initialUserSettings,hasCompletedOnboarding:true}};
  assert.equal(decodeRecoveryData(JSON.stringify(archive)).habits[0].personalization,undefined);
  const personalized={...habit,personalization:{...emptyPersonalization(),motivation:'Feel healthier',triggers:['Boredom']}};
  const restored=decodeRecoveryData(JSON.stringify({...archive,data:{...archive.data,habits:[personalized]}}));assert.deepEqual(restored.habits[0],personalized);assert.equal(restored.hasCompletedOnboarding,true);
  assert.throws(()=>decodeRecoveryData(JSON.stringify({...archive,data:{...archive.data,habits:[{...personalized,personalization:{...personalized.personalization,triggers:['invented']}}]}})));
});
test('yearly discount uses twelve actual monthly prices with consistent currency formatting',()=>{
  assert.deepEqual(PREMIUM_SAVINGS,{twelveMonths:5988,savedCents:2989,percent:49.9,monthlyEquivalentCents:2999/12});
  assert.equal(formatPlanMoney(PREMIUM_SAVINGS.savedCents),'$29.89');assert.equal(formatPlanMoney(PREMIUM_SAVINGS.monthlyEquivalentCents),'$2.50');
  assert.equal(annualPlanSavings(500,6000).percent,0);assert.equal(annualPlanSavings(500,7000).savedCents,0);assert.equal(annualPlanSavings(500,0).percent,100);
  for(const values of [[0,100],[-1,100],[100,-1],[100.5,100],[NaN,100],[Number.MAX_SAFE_INTEGER,100]])assert.throws(()=>annualPlanSavings(values[0],values[1]));
  assert.equal(MOCK_PLANS.monthly.trialDays,0);assert.equal(MOCK_PLANS.yearly.trialDays,0);
});
