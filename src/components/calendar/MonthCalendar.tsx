import {CalendarPressable} from './CalendarMotion';
import React,{useMemo} from 'react';
import {View,StyleSheet,useWindowDimensions} from 'react-native';
import {colors,useTheme,useThemedStyles} from '../../design-system';
import {CalendarText as Text,useCalendarBands,CalendarBandId} from './calendarAppearance';
import {CheckIn} from '../../data/types';
import {ALCOHOL_BANDS,DAY_LABELS,getCheckInBand,STATUS_BANDS} from '../../utils/calendar';
import {referenceMonthDays} from '../../utils/calendarLayout';
import {formatLocalDate} from '../../utils/date';

interface Props {year:number;month:number;today:string;selected:string;entries:CheckIn[];alcohol:boolean;onSelect:(date:string)=>void}
export function MonthCalendar({year,month,today,selected,entries,alcohol,onSelect}:Props){
 const styles=useThemedStyles(baseStyles);const {colors,isDark}=useTheme();const tones=useCalendarBands();const {width}=useWindowDimensions();
 const byDate=useMemo(()=>new Map(entries.map(entry=>[entry.date,entry])),[entries]);
 const days=useMemo(()=>referenceMonthDays(year,month),[year,month]);
 const bands=alcohol?[...ALCOHOL_BANDS,...(entries.some(e=>e.status==='relapsed'&&!e.consumption)?[STATUS_BANDS[2]]:[])]:STATUS_BANDS;
 const rows=Array.from({length:days.length/7},(_,i)=>days.slice(i*7,i*7+7));
 return <View style={[styles.card,{padding:width>=640?20:16}]}>
  <View style={styles.weekdays}>{DAY_LABELS.map(label=><View key={label} style={styles.weekdayCell}><Text weight="600" color="tertiary" style={styles.weekday} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={.75}>{label}</Text></View>)}</View>
  <View style={styles.grid} accessibilityLabel="Monthly check-in grid">{rows.map((row,index)=><View key={index} style={styles.week}>
   {row.map(day=>{
    const entry=byDate.get(day.date),band=entry?getCheckInBand(entry,alcohol):null;
    const tone=band?tones[band.id as CalendarBandId]:null;
    const future=day.date>today,current=day.date===today,chosen=day.date===selected;
    return <CalendarPressable key={day.date} disabled={future} activeOpacity={.65} onPress={()=>onSelect(day.date)}
     accessibilityRole="button" accessibilityState={{selected:chosen,disabled:future}} aria-pressed={chosen}
     accessibilityLabel={`${formatLocalDate(day.date,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}${current?', Today':''}, ${future?'Upcoming':band?`${band.label}${entry?.consumption?.drinks!==undefined?', '+entry.consumption.drinks+' drinks':''}`:'No check-in'}`}
     style={[styles.dayTouch,future&&styles.future]} hitSlop={3}>
      <View style={[styles.day,{borderColor:isDark?colors.border.subtle:'#EAE3EF'},
       future&&{backgroundColor:isDark?colors.background.subtle:'#FAF9F680',borderColor:'transparent'},
       tone&&!future&&{backgroundColor:tone.background,borderColor:tone.border}]}>
       <Text weight="700" tabular style={[styles.dayNumber,!day.inMonth&&{color:isDark?colors.text.secondary:'#A093AB'},future&&{color:isDark?colors.text.muted:'#C5BED0'},tone&&!future&&{color:tone.text},current&&styles.todayNumber]}>{day.day}</Text>
       <View style={styles.dotSpace}>{!future&&(tone||current)&&<View style={[styles.dot,{width:tone?8:6,height:tone?8:6,backgroundColor:tone?.color||colors.accent.primary,opacity:tone?1:.4}]}/>}</View>
      </View>
      {chosen&&!future&&<View pointerEvents="none" style={styles.selection}/>}
    </CalendarPressable>;
   })}
  </View>)}</View>
  <View style={styles.legend}><Text weight="600" color="tertiary" style={styles.legendTitle}>LEGEND ({alcohol?'DRINKS':'DAILY STATUS'})</Text><View style={styles.chips}>{bands.map(band=><View key={band.id} style={styles.chip}><View style={[styles.legendDot,{backgroundColor:tones[band.id as CalendarBandId].color}]}/><Text weight="500" style={styles.chipText}>{band.short}</Text></View>)}</View></View>
 </View>;
}
const baseStyles=StyleSheet.create({
 card:{backgroundColor:colors.background.surface,borderWidth:1,borderColor:colors.border.subtle,borderRadius:24,shadowColor:'#302B40',shadowOpacity:.04,shadowRadius:1,shadowOffset:{width:0,height:1},elevation:1},
 weekdays:{flexDirection:'row',gap:4,marginBottom:8},weekdayCell:{flex:1,minWidth:0,alignItems:'center',paddingVertical:4},
 weekday:{fontSize:12,lineHeight:18},grid:{gap:6},week:{flexDirection:'row',gap:6},
 dayTouch:{flex:1,minWidth:0},day:{minHeight:46,padding:4,borderWidth:1,borderRadius:16,justifyContent:'center',alignItems:'center',backgroundColor:colors.background.surface},
 dayNumber:{fontSize:12,lineHeight:18},todayNumber:{textDecorationLine:'underline',textDecorationColor:colors.accent.primary},
 dotSpace:{height:12,marginTop:4,alignItems:'center',justifyContent:'center'},dot:{borderRadius:4},
 selection:{position:'absolute',top:-3,left:-3,right:-3,bottom:-3,borderWidth:2,borderColor:colors.accent.primary,borderRadius:18},
 future:{opacity:.5},legend:{marginTop:16,paddingTop:14,borderTopWidth:1,borderTopColor:colors.background.muted,gap:8},
 legendTitle:{fontSize:12,lineHeight:18,letterSpacing:.5},chips:{flexDirection:'row',flexWrap:'wrap',gap:8},
 chip:{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:10,paddingVertical:4,borderWidth:1,borderColor:colors.border.subtle,borderRadius:12,backgroundColor:colors.background.canvas},
 legendDot:{width:10,height:10,borderRadius:5},chipText:{fontSize:12,lineHeight:18},
});
