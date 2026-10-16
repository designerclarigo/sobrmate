import { AlcoholConsumption, CheckInStatus, Habit } from './types';

export function isAlcoholTracker(habit: Habit): boolean {
  if (habit.trackingMetric) return habit.trackingMetric === 'drinks';
  // Older canonical archives did not retain the catalog's alcohol group.
  return /alcohol|beer|cider|wine|whiskey|whisky|bourbon|vodka|rum\b|gin\b|tequila|spirits/i.test(habit.title);
}

export function validateConsumption(value: AlcoholConsumption | undefined, status: CheckInStatus): void {
  if (value === undefined) return;
  if (!value || typeof value.blackout !== 'boolean'
    || (value.drinks !== undefined && (!Number.isInteger(value.drinks) || value.drinks < 0 || value.drinks > 1000))
    || (!value.blackout && value.drinks === undefined)) {
    throw new Error('Enter a whole drink count from 0 to 1,000, or record a memory gap without a count.');
  }
  const used = value.blackout || (value.drinks ?? 0) > 0;
  if (used !== (status === 'relapsed')) throw new Error('The drink count and check-in status do not match.');
}

export function getTrackingUnit(habit: Habit): string | null {
  if(isAlcoholTracker(habit))return 'drinks';
  if(habit.trackingMetric==='status')return null;
  if(habit.trackingUnit)return habit.trackingUnit;
  if(habit.trackingMetric==='minutes'||/social media|gaming|screen|scroll|smartphone|internet/i.test(habit.title))return 'minutes';
  if(/cigarette|smoking|tobacco/i.test(habit.title))return 'cigarettes';
  if(/vap(e|ing)/i.test(habit.title))return 'puffs';
  return habit.trackingMetric==='count'?'uses':null;
}
export function validateQuantity(quantity:number|undefined,status:CheckInStatus,habit:Habit):void {
  if(quantity===undefined)return;
  const unit=getTrackingUnit(habit);
  if(!unit||unit==='drinks'||!Number.isInteger(quantity)||quantity<0||quantity>(unit==='minutes'?1440:100000))throw new Error('Enter a valid whole quantity for this habit.');
  if((quantity>0)!==(status==='relapsed'))throw new Error('The quantity and check-in status do not match.');
}
