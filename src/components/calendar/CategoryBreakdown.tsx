import React,{useMemo} from 'react';
import {View,StyleSheet} from 'react-native';
import {colors,useThemedStyles} from '../../design-system';
import {CheckIn,Habit} from '../../data/types';
import {isAlcoholTracker} from '../../data/tracking';
import {calendarBandCounts} from '../../utils/calendarLayout';
import {CalendarBandId,CalendarText as Text,useCalendarBands} from './calendarAppearance';

export function CategoryBreakdown({entries,habit,start,end,today}:{entries:CheckIn[];habit:Habit;start:string;end:string;today:string}){
 const styles=useThemedStyles(baseStyles),tones=useCalendarBands();
 const counts=useMemo(()=>calendarBandCounts(entries,habit,start,end,today),[entries,habit,start,end,today]);
 const labels:{id:CalendarBandId;label:string}[]=isAlcoholTracker(habit)?[{id:'clean',label:'Clean / 0'},{id:'low',label:'Mild'},{id:'moderate',label:'Moderate'},{id:'heavy',label:'Heavy'},{id:'blackout',label:'Blackout'},...(counts.used?[{id:'used' as const,label:'Used · amount unspecified'}]:[])]:[{id:'clean',label:'Clean / 0'},{id:'urges',label:'Urges, no use'},{id:'used',label:'Use recorded'}];
 return <View style={styles.card}><Text weight="700" style={styles.heading}>Category Breakdown</Text><View style={styles.chips}>{labels.map(({id,label})=><View key={id} style={[styles.chip,{backgroundColor:tones[id].background,borderColor:tones[id].border}]}><Text weight="600" style={[styles.label,{color:tones[id].text}]}>{label}: {counts[id]||0}</Text></View>)}</View></View>;
}
const baseStyles=StyleSheet.create({
 card:{marginTop:16,padding:20,borderRadius:24,borderWidth:1,borderColor:colors.border.subtle,backgroundColor:colors.background.surface,shadowColor:'#302B40',shadowOpacity:.04,shadowRadius:1,shadowOffset:{width:0,height:1},elevation:1},
 heading:{fontSize:14,lineHeight:21,marginBottom:12},chips:{flexDirection:'row',flexWrap:'wrap',gap:8},
 chip:{paddingHorizontal:12,paddingVertical:6,borderWidth:1,borderRadius:12},label:{fontSize:12,lineHeight:18},
});
