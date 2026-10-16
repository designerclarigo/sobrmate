import type {CatalogHabit} from './habitCatalog';
import {RecoveryPersonalization,validatePersonalization} from './personalization';
import type {RecoveryData} from './recovery';
import type {Habit} from './types';

export interface TrackerSetupForm {
  currentStep:number;habitTitle:string;quitTiming:'now'|'today_morning'|'yesterday'|'3days'|'custom';customDaysAgo:string;
  personalWhy:string;selectedImprovements:string[];currentMindset:string;personalGoal:string;
  customMetric:'status'|'count'|'minutes';customUnit:string;financialEnabled:boolean;costPerDay:string;timeEnabled:boolean;hoursPerDay:string;
  personalization:RecoveryPersonalization;questionnaireStep:number;
}
export interface TrackerSetupDraft {version:1;id:string;phase:'selecting'|'wizard';habit:Partial<CatalogHabit>;form?:TrackerSetupForm}
export const trackerIdForDraft=(id:string)=>`habit-${id}`;
export function withSetupDraft(data:RecoveryData,draft:TrackerSetupDraft|null):RecoveryData {
  if(!draft)return {...data,setupDraft:undefined};
  validateSetupDraft(draft);
  if(data.habits.some(habit=>habit.id===trackerIdForDraft(draft.id)))return data;
  return {...data,setupDraft:draft};
}
export function commitSetupHabit(data:RecoveryData,habit:Habit,draftId?:string):RecoveryData {
  if(data.habits.some(existing=>existing.id===habit.id))return data;
  return {...data,habits:[habit,...data.habits],activeHabitId:habit.id,hasCompletedSetup:true,
    setupDraft:draftId&&data.setupDraft?.id===draftId?undefined:data.setupDraft};
}
export function validateSetupDraft(value:TrackerSetupDraft):void {
  const fail=()=>{throw new Error('The saved tracker setup could not be read. Your records have been kept.');};
  if(!value||value.version!==1||typeof value.id!=='string'||!/^setup-[a-zA-Z0-9-]{8,80}$/.test(value.id)||!['selecting','wizard'].includes(value.phase)||!value.habit||typeof value.habit!=='object')return fail();
  const habit=value.habit;
  if(habit.category!==undefined&&!['alcohol','nicotine','substances','behavioral','custom'].includes(habit.category))return fail();
  for(const field of ['id','title','categoryLabel','iconName','accentColor','suggestedPledge'] as const)if(habit[field]!==undefined&&(typeof habit[field]!=='string'||habit[field]!.length>10000))return fail();
  for(const field of ['defaultCostPerDay','defaultHoursPerDay'] as const)if(habit[field]!==undefined&&(!Number.isFinite(habit[field])||habit[field]!<0))return fail();
  if(habit.tags!==undefined&&(!Array.isArray(habit.tags)||habit.tags.length>100||habit.tags.some(tag=>typeof tag!=='string'||tag.length>200)))return fail();
  const form=value.form;if(!form)return;
  if(!Number.isInteger(form.currentStep)||form.currentStep<1||form.currentStep>9||!Number.isInteger(form.questionnaireStep)||form.questionnaireStep<0||form.questionnaireStep>3||!['now','today_morning','yesterday','3days','custom'].includes(form.quitTiming)||!['status','count','minutes'].includes(form.customMetric))return fail();
  for(const field of ['habitTitle','customDaysAgo','personalWhy','currentMindset','personalGoal','customUnit','costPerDay','hoursPerDay'] as const)if(typeof form[field]!=='string'||form[field].length>10000)return fail();
  if(typeof form.financialEnabled!=='boolean'||typeof form.timeEnabled!=='boolean'||!Array.isArray(form.selectedImprovements)||form.selectedImprovements.length>50||form.selectedImprovements.some(item=>typeof item!=='string'||item.length>200))return fail();
  validatePersonalization(form.personalization);
}
