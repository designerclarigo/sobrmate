import React from 'react';
import {View,StyleSheet,useWindowDimensions} from 'react-native';
import {ChartNoAxesCombined,X} from 'lucide-react-native';
import {useRecoveryStore} from '../../data/store';
import {colors,useTheme,useThemedStyles} from '../../design-system';
import {usePremium} from '../../data/premium';
import {getTrackingUnit,isAlcoholTracker} from '../../data/tracking';
import {calendarStatistics,latestCheckIns} from '../../utils/calendar';
import {getLocalDateString} from '../../utils/date';
import {formatSavedMoney,formatReclaimedTime} from '../../utils/metrics';
import {CalendarPanel} from './CalendarPanel';
import {CalendarText as Text,CalendarButton as Button} from './calendarAppearance';
import {CalendarPressable} from './CalendarMotion';

export function AdvancedStatistics({visible,onClose}:{visible:boolean;onClose:()=>void}){
 const {activeHabit,habits,checkIns,currentTime}=useRecoveryStore('day');const {colors}=useTheme();const styles=useThemedStyles(baseStyles);const premium=usePremium();const {fontScale,width}=useWindowDimensions();
 const habit=activeHabit||habits[0],today=getLocalDateString(currentTime),entries=habit?latestCheckIns(checkIns,habit.id,today):[];
 const access=premium.canAccess('advanced_statistics'),start=entries[0]?.date||today;
 const stats=habit?calendarStatistics(entries,habit,entries.reduce((a,b)=>b.date<a?b.date:a,start),today,today):null;
 const unit=habit?getTrackingUnit(habit):null,alcohol=!!habit&&isAlcoholTracker(habit);
 const rows=stats&&habit?[['Check-ins recorded',String(stats.logged)],['Zero-use days',String(stats.zeroDays)],['Zero-use rate',stats.zeroRate===null?'—':`${stats.zeroRate}%`],['Longest logged streak',`${stats.bestStreak} days`],['Current logged streak',`${stats.recordedStreak} days`],...(unit?[[`Known ${unit}`,String(alcohol?stats.knownDrinks:stats.knownQuantity)],['Unknown quantities',String(alcohol?stats.unknownCounts:stats.unknownQuantities)]]:[]),['Estimated money saved',habit.financialTracking.enabled?formatSavedMoney(stats.moneySaved,habit.financialTracking.currency):'—'],['Estimated time reclaimed',habit.timeTracking.enabled?formatReclaimedTime(stats.hoursSaved):'—']]:[];
 return <CalendarPanel visible={visible} onClose={onClose} presentation="center" handle={false}
  header={<View style={styles.header}><ChartNoAxesCombined size={17} color={colors.accent.primary}/><Text weight="600" style={[styles.title,{flex:1}]} accessibilityRole="header">Meaningful perspective.</Text><CalendarPressable accessibilityRole="button" accessibilityLabel="Close advanced statistics" onPress={onClose} style={styles.close}><X size={16} color={colors.text.tertiary}/></CalendarPressable></View>}
  footer={<Button label={access?'Done':'Explore mock Premium'} fullWidth onPress={access?onClose:()=>{onClose();premium.openPaywall('advanced_statistics');}}/>}>
  <View style={{gap:16}}><Text color="accent" weight="600" style={styles.small}>{habit?.title||'Create a tracker to explore your progress'}</Text><Text color="secondary" style={styles.small}>Your recorded history, together. Missing days are never counted as successful. Savings use your configured daily estimates and zero-use check-ins.</Text>
  {access&&stats?rows.map(([label,value])=><View key={label} style={[styles.row,(fontScale>1.2||width<330)&&{flexDirection:'column',alignItems:'flex-start'}]}><Text style={[styles.small,{flexShrink:1}]} color="secondary">{label}</Text><Text mono weight="600" style={styles.value}>{value}</Text></View>):<View style={styles.preview}><Text weight="600" style={styles.title}>Know your daily rhythm.</Text><Text color="secondary" style={styles.small}>Unlock recorded streaks, zero-use rates, consumption totals, and savings across your full history.</Text><Text style={styles.small} color="accent">Premium preview · No sample statistics</Text></View>}
  </View>
 </CalendarPanel>;
}
const baseStyles=StyleSheet.create({
 header:{flexDirection:'row',alignItems:'center',gap:8},title:{fontSize:14,lineHeight:21},small:{fontSize:12,lineHeight:18},
 close:{width:44,height:44,alignItems:'center',justifyContent:'center',borderRadius:14},
 row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,paddingVertical:12,borderBottomWidth:1,borderColor:colors.border.subtle},value:{fontSize:14,lineHeight:21},
 preview:{padding:20,borderRadius:20,borderWidth:1,borderColor:colors.accent.primaryBorder,backgroundColor:colors.accent.primaryLight,gap:12},
});
