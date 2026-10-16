import {CalendarPressable} from './CalendarMotion';
import React from 'react';
import {View,StyleSheet} from 'react-native';
import {Info,Lock,SlidersHorizontal,X} from 'lucide-react-native';
import {colors,useTheme,useThemedStyles} from '../../design-system';
import {CalendarText as Text,CalendarButton,useCalendarBands,CalendarBandId} from './calendarAppearance';
import {CalendarPanel} from './CalendarPanel';
import {Habit} from '../../data/types';
import {isAlcoholTracker,getTrackingUnit} from '../../data/tracking';
import {ALCOHOL_BANDS,STATUS_BANDS} from '../../utils/calendar';

export function TrackingRulesModal({visible,onClose,habit}:{visible:boolean;onClose:()=>void;habit:Habit}){
 const {colors}=useTheme();const styles=useThemedStyles(baseStyles);const tones=useCalendarBands();const alcohol=isAlcoholTracker(habit),unit=getTrackingUnit(habit);
 const header=<View style={styles.heading}><SlidersHorizontal size={16} color={colors.accent.primary}/><Text weight="700" style={styles.title}>Tracking Rules · {habit.title}</Text><CalendarPressable accessibilityRole="button" accessibilityLabel="Close tracking rules" onPress={onClose} style={styles.close}><X size={16} color={colors.text.secondary}/></CalendarPressable></View>;
 return <CalendarPanel visible={visible} onClose={onClose} presentation="center" handle={false} header={header}
  footer={<View style={{alignItems:'flex-end'}}><CalendarButton label="Close" variant="ghost" onPress={onClose}/></View>}>
  <View style={styles.metric}><View style={{flex:1,gap:4}}><Text color="tertiary" weight="600" style={styles.label}>TRACKING METRIC</Text><Text weight="600" style={styles.small}>{alcohol?'Alcohol (Drinks)':unit?`Quantity (${unit})`:'Daily status'}</Text></View><View style={styles.lock}><Lock size={10} color={colors.accent.primary}/><Text color="accent" weight="600" style={styles.tiny}>{alcohol?'Standardized':'Consistent'}</Text></View></View>
  <Text color="secondary" weight="600" style={[styles.label,{marginBottom:8}]}>COLOR CATEGORIES</Text>
  {(alcohol?ALCOHOL_BANDS:STATUS_BANDS).map(band=><View key={band.id} style={styles.row}><View style={[styles.dot,{backgroundColor:tones[band.id as CalendarBandId].color}]}/><Text weight="500" style={[styles.small,{flex:1}]}>{band.label}</Text><Text mono tabular color="secondary" style={styles.tiny}>{band.short}</Text></View>)}
  <View style={styles.note}><Info size={15} color={colors.accent.primary}/><Text color="accent" style={[styles.small,{flex:1,lineHeight:19.5}]}>{alcohol?'0 = Clean, 1–2 = Low, 3–5 = Moderate, 6+ = Heavy. Blackout overrides the count, including when it is unknown.':'Clean and urge-only check-ins count as zero-use days. Use entries break a recorded streak.'}{'\n'}Missing days are never counted as zero.</Text></View>
 </CalendarPanel>;
}
const baseStyles=StyleSheet.create({
 heading:{flexDirection:'row',alignItems:'center',gap:8},title:{flex:1,fontSize:14,lineHeight:21},close:{minWidth:32,minHeight:44,alignItems:'center',justifyContent:'center'},
 metric:{flexDirection:'row',alignItems:'center',gap:8,borderWidth:1,borderColor:colors.border.subtle,backgroundColor:colors.background.surface,borderRadius:16,padding:12,marginBottom:16},
 label:{fontSize:12,lineHeight:18,letterSpacing:.5},small:{fontSize:12,lineHeight:18},tiny:{fontSize:12,lineHeight:18},
 lock:{flexDirection:'row',gap:4,alignItems:'center',backgroundColor:colors.accent.primaryLight,borderRadius:20,paddingHorizontal:8,paddingVertical:3},
 row:{flexDirection:'row',alignItems:'center',gap:8,padding:10,backgroundColor:colors.background.surface,borderWidth:1,borderColor:colors.border.subtle,borderRadius:12,marginBottom:6},
 dot:{width:12,height:12,borderRadius:6},note:{flexDirection:'row',gap:8,backgroundColor:colors.background.muted,borderWidth:1,borderColor:colors.accent.primaryBorder,borderRadius:16,padding:12,marginTop:10},
});
