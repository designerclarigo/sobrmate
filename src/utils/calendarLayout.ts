import {getCheckInBand,getMonthDays,latestCheckIns} from './calendar';
import {CheckIn,Habit} from '../data/types';
import {isAlcoholTracker} from '../data/tracking';
import {getLocalDateString,parseLocalDate} from './date';

/** Reference month view always reserves five or six complete Sunday-first rows. */
export function referenceMonthDays(year:number,month:number) {
  const days=getMonthDays(year,month);
  while(days.length<35){
    const next=parseLocalDate(days[days.length-1].date);next.setDate(next.getDate()+1);
    days.push({date:getLocalDateString(next),day:next.getDate(),inMonth:next.getMonth()===month&&next.getFullYear()===year});
  }
  return days;
}

/** Category counts follow the same tracker, date range, and latest-record policy as statistics. */
export function calendarBandCounts(entries:CheckIn[],habit:Habit,start:string,end:string,today:string){
  const counts:Record<string,number>={};
  for(const entry of latestCheckIns(entries,habit.id,today)){
    if(entry.date<start||entry.date>end)continue;
    const id=getCheckInBand(entry,isAlcoholTracker(habit)).id;
    counts[id]=(counts[id]||0)+1;
  }
  return counts;
}
