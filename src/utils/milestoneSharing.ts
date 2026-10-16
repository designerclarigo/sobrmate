import {Habit,Milestone} from '../data/types';
import {milestonePresentation} from './milestonePresentation';

export const MILESTONE_SHARE_STYLES=['Classic','Editorial','Bloom','Focus','Minimal','Letter'] as const;
export type MilestoneShareStyle=typeof MILESTONE_SHARE_STYLES[number];
export const MILESTONE_SHARE_PALETTES=[
 {name:'Lilac',background:'#EEE7F5',ink:'#655078',muted:'#826B92',border:'#DACCE6',glow:'#F9F4FD'},
 {name:'Sage',background:'#E8EFE3',ink:'#4F654B',muted:'#6E8269',border:'#CDDCC6',glow:'#F5F9F0'},
 {name:'Mist',background:'#E6EEF1',ink:'#4B6671',muted:'#6C8590',border:'#CADCE3',glow:'#F4F9FB'},
 {name:'Rose',background:'#F3E5E8',ink:'#865B69',muted:'#9D7481',border:'#E5CCD3',glow:'#FCF3F5'},
 {name:'Sand',background:'#F2EADB',ink:'#786146',muted:'#937E62',border:'#E1D3B9',glow:'#FBF7EE'},
 {name:'Ivory',background:'#FCFAF5',ink:'#6A5B73',muted:'#877890',border:'#E7DFEB',glow:'#F3EDF7'},
] as const;
export type MilestoneSharePalette=typeof MILESTONE_SHARE_PALETTES[number];

/** Only public achievement copy is used. Private motivation, pledges and journal entries are excluded. */
export function milestoneShareText(habit:Pick<Habit,'title'>,milestone:Milestone){
 const title=milestonePresentation(milestone).title,quote=milestone.affirmation.trim();
 return `I earned the ${title} milestone on my ${habit.title} journey with SobrMate!${quote?' “'+quote+'”':''}`;
}
