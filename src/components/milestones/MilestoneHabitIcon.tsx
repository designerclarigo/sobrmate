import React from 'react';
import {Beer,Camera,Cannabis,Cigarette,Cloud,Coffee,Cookie,DollarSign,Flame,Gamepad2,Ghost,GlassWater,Heart,Leaf,Lock,Martini,MessageCircle,Music,Pill,Shield,ShoppingBag,Smartphone,Sparkles,Sprout,Sun,Users,Wind,Wine,Zap,LucideIcon} from 'lucide-react-native';
import {Habit} from '../../data/types';
import {HABIT_CATALOG} from '../../data/habitCatalog';
import {isAlcoholTracker} from '../../data/tracking';
const savedIcons:Record<string,LucideIcon>={Beer,Camera,Cannabis,Cigarette,Cloud,Coffee,Cookie,DollarSign,Flame,Gamepad2,Ghost,GlassWater,Heart,Leaf,Lock,Martini,MessageCircle,Music,Pill,Shield,ShoppingBag,Smartphone,Sparkles,Sprout,Sun,Users,Wind,Wine,Zap};
/** Published habit glyphs are presentation only; saved tracking units and custom icons remain intact. */
export function MilestoneHabitIcon({habit,size=14,color}:{habit:Habit;size?:number;color:string}){
 const name=habit.title.toLowerCase(),category=HABIT_CATALOG.find(item=>item.title.toLowerCase()===name)?.category;
 const Icon=isAlcoholTracker(habit)?/wine/.test(name)?Wine:/vodka|gin|rum/.test(name)?Martini:/whiskey|whisky/.test(name)?GlassWater:Beer
  :category==='nicotine'?/vap/.test(name)?Wind:Cigarette
  :category==='substances'?/cannabis|marijuana|weed/.test(name)?Cannabis:/edible/.test(name)?Cookie:/vap/.test(name)?Wind:Pill
  :category==='behavioral'||habit.category==='digital'?/instagram/.test(name)?Camera:/tiktok/.test(name)?Music:/facebook/.test(name)?Users:/twitter/.test(name)?MessageCircle:/snapchat/.test(name)?Ghost:Smartphone
  :/vap/.test(name)?Wind:/cigarette|smoking/.test(name)?Cigarette:/cannabis|marijuana|weed/.test(name)?Cannabis:/edible/.test(name)?Cookie:savedIcons[habit.iconName]||Sprout;
 return <Icon size={size} strokeWidth={1.65} color={color}/>;
}
