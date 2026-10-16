import React from 'react';
import {Award,Compass,Crown,Droplets,Flag,Flame,Heart,Mountain,Moon,ShieldCheck,Sparkles,Sprout,Star,Sun,Trophy,Wind,Zap,LucideIcon} from 'lucide-react-native';
import {Milestone} from '../../data/types';
const referenceIcons:Record<number,LucideIcon>={1:Sprout,2:Sprout,3:Sun,4:Sun,5:Flag,7:Flag,10:Award,14:Award,21:Sparkles,30:Sparkles,60:Trophy,90:Trophy,180:Mountain,365:Mountain};
const catalogIcons:Record<string,LucideIcon>={Award,Compass,Crown,Droplets,Flag,Flame,Heart,Mountain,Moon,ShieldCheck,Sparkles,Sprout,Star,Sun,Trophy,Wind,Zap};
export function MilestoneEmblem({milestone,size=21,color,strokeWidth=1.45}:{milestone:Milestone;size?:number;color:string;strokeWidth?:number}){
 const Icon=referenceIcons[milestone.targetDays]||catalogIcons[milestone.iconName||'Award']||Award;
 return <Icon size={size} color={color} strokeWidth={strokeWidth}/>;
}
