import {Milestone} from '../data/types';

/** Reference display copy; the existing milestone IDs, goals, names and affirmations are retained. */
export function milestonePresentation(milestone:Milestone){
 const days=milestone.targetDays;
 const labels:Record<number,{title:string;subtitle:string}>={
  7:{title:'1 Week · 7 days',subtitle:'7 Days Clean'},10:{title:'10 Days',subtitle:'Double Digits Clean'},14:{title:'2 Weeks · 14 days',subtitle:'14 Days Clean'},
  21:{title:'3 Weeks · 21 days',subtitle:'Habit Milestone'},30:{title:'1 Month · 30 days',subtitle:'One Full Month'},
  60:{title:'2 Months · 60 days',subtitle:'Two Full Months'},90:{title:'3 Months · 90 days',subtitle:'Quarter Year Milestone'},
  180:{title:'6 Months · 180 days',subtitle:'Half Year Milestone'},365:{title:'1 Year · 365 days',subtitle:'One Year Clean'},
 };
 return labels[days]||{title:milestone.timeLabel||`${days} ${days===1?'Day':'Days'}`,subtitle:days<=5?`${days*24} Hours Clean`:milestone.description};
}
