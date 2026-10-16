import React,{useMemo} from 'react';
import {View,StyleSheet} from 'react-native';
import {Check,ChevronRight,Lock} from 'lucide-react-native';
import {CalculatedMilestone} from '../../utils/milestones';
import {milestonePresentation} from '../../utils/milestonePresentation';
import {useMilestoneAppearance,MilestoneText as Text,MilestonePalette} from './milestoneAppearance';
import {MilestonePressable} from './MilestoneMotion';
import {MilestoneEmblem} from './MilestoneEmblem';

interface Props{milestone:CalculatedMilestone;currentDays:number;onPress:(id:string)=>void}
export const MilestoneCard=React.memo(function MilestoneCard({milestone,currentDays,onPress}:Props){
 const p=useMilestoneAppearance(),styles=useMemo(()=>makeStyles(p),[p]),copy=milestonePresentation(milestone);
 const remaining=Math.max(0,milestone.targetDays-currentDays),date=milestone.achievedDateFormatted||milestone.expectedDateFormatted;
 return <MilestonePressable onPress={()=>onPress(milestone.id)} accessibilityRole="button" accessibilityLabel={`${copy.title}, ${milestone.title}, ${milestone.achieved?'Earned':remaining+' '+(remaining===1?'day':'days')+' to go'}, view details`}
  style={[styles.row,milestone.isNext&&styles.next]}>
  <View style={[styles.emblem,milestone.achieved&&styles.earnedEmblem]}><MilestoneEmblem milestone={milestone} color={milestone.achieved?p.earnedIcon:p.emblemInk}/></View>
  <View style={{flex:1,minWidth:0}}><Text weight="500" style={styles.title}>{copy.title}</Text>
   <View style={styles.captionRow}>{milestone.achieved&&<Check size={11} strokeWidth={1.8} color={p.earnedInk}/>}<Text style={[styles.caption,milestone.achieved&&{color:p.earnedInk}]}>{milestone.achieved?`Earned · ${date}`:`${remaining} ${remaining===1?'day':'days'} to go · ${date}`}</Text></View>
  </View>
  <View style={styles.end}>{!milestone.achieved&&<Lock size={12} strokeWidth={1.6} color={p.muted}/>}<ChevronRight size={15} strokeWidth={1.5} color={p.muted}/></View>
 </MilestonePressable>;
});
const makeStyles=(p:MilestonePalette)=>StyleSheet.create({
 row:{width:'100%',flexDirection:'row',alignItems:'center',gap:13,minHeight:82,padding:14,borderWidth:1,borderColor:p.border,borderRadius:19,backgroundColor:p.surface},
 next:{borderColor:p.nextBorder,backgroundColor:p.nextSurface},
 emblem:{width:44,height:44,borderRadius:15,borderWidth:1,borderColor:p.emblemBorder,backgroundColor:p.emblemSurface,alignItems:'center',justifyContent:'center'},
 earnedEmblem:{backgroundColor:p.goldSurface,borderColor:p.goldBorder},
 title:{fontSize:13,lineHeight:16.9,color:p.rowInk,marginBottom:5},caption:{fontSize:10,lineHeight:16,color:p.caption,flexShrink:1},
 captionRow:{flexDirection:'row',alignItems:'center',gap:4,flexWrap:'wrap'},end:{flexDirection:'row',alignItems:'center',gap:8},
});
