import { useTheme, useThemedStyles } from '../../design-system/theme';
import React from 'react';
import { View, StyleSheet,useWindowDimensions } from 'react-native';
import { Clock, DollarSign } from 'lucide-react-native';
import { colors } from '../../design-system';
import { CalendarText as Text } from './calendarAppearance';
import { Habit } from '../../data/types';
import { getTrackingUnit } from '../../data/tracking';
import { calendarStatistics, StatisticsPeriod } from '../../utils/calendar';
import { formatReclaimedTime, formatSavedMoney } from '../../utils/metrics';

export function CalendarStatistics({ stats, period, habit, alcohol, rangeLabel }: { stats:ReturnType<typeof calendarStatistics>; period:StatisticsPeriod; habit:Habit; alcohol:boolean; rangeLabel:string }) {
  const { colors,isDark } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const {fontScale}=useWindowDimensions();const unit=getTrackingUnit(habit);const hasQuantity=!!unit&&!alcohol;

  const labels = { week:'Week', month:'Month', year:'Year', all:'All Time' };
  return <View style={styles.card} accessibilityLabel={`Statistics, ${labels[period]}. ${rangeLabel}`}>
    <View style={styles.header}><Text weight="700" style={styles.title}>Statistics <Text color="accent" weight="700" style={styles.title}>· {labels[period]}</Text></Text><Text color="tertiary" style={styles.small}>{stats.logged} {stats.logged === 1 ? 'day' : 'days'} logged</Text></View>
    <View style={[styles.grid,fontScale>1.25&&{flexDirection:'column'}]}>
      <View style={[styles.box,fontScale>1.25&&{width:'100%'}, { backgroundColor:colors.background.subtle,borderColor:isDark?colors.border.subtle:'#EBE3F0' }]}><Text color="secondary" style={styles.label}>ADHERENCE</Text><Text mono color="accent" weight="700" style={styles.value} tabular>{stats.zeroRate===null?'—':`${stats.zeroRate}%`} <Text style={styles.small} color="secondary">clean</Text></Text></View>
      <View style={[styles.box,fontScale>1.25&&{width:'100%'}, { backgroundColor:colors.accent.successLight, borderColor:colors.accent.successBorder }]}><Text style={[styles.label, { color:colors.accent.successDark }]}>CLEAN DAYS</Text><Text mono weight="700" style={[styles.value,{color:colors.accent.successDark}]} tabular>{stats.zeroDays} <Text style={[styles.amount,{color:colors.accent.successDark}]}>{stats.zeroDays === 1 ? 'day' : 'days'}</Text></Text></View>
      <View style={[styles.box,fontScale>1.25&&{width:'100%'}]}><Text color="tertiary" style={styles.label}>TOTAL RECORDED</Text><Text mono weight="700" style={styles.quantityValue} tabular>{alcohol ? stats.knownDrinks : hasQuantity?stats.knownQuantity:stats.logged - stats.zeroDays} <Text style={styles.small}>{alcohol ? 'drinks' : hasQuantity?unit:'use days'}</Text></Text>{(alcohol?stats.unknownCounts:hasQuantity?stats.unknownQuantities:0) > 0 && <Text color="tertiary" style={styles.tiny}>+ {alcohol?stats.unknownCounts:stats.unknownQuantities} unknown {(alcohol?stats.unknownCounts:stats.unknownQuantities) === 1 ? 'count' : 'counts'}</Text>}</View>
      <View style={[styles.box,fontScale>1.25&&{width:'100%'}]}><Text color="tertiary" style={styles.label}>RECORDED STREAK</Text><Text mono weight="700" style={styles.quantityValue} tabular>{stats.recordedStreak} <Text style={styles.small}>{stats.recordedStreak === 1 ? 'day' : 'days'}</Text></Text></View>
    </View>
    <View style={styles.estimates}>
      <View style={styles.row}><View style={[styles.icon, { backgroundColor:colors.accent.successLight }]}><DollarSign size={16} color={colors.status.success} /></View><View style={{ flex:1 }}><Text weight="600" style={styles.small}>Money Saved</Text><Text color="secondary" style={styles.tiny}>{habit.financialTracking.enabled ? `Based on ${stats.zeroDays} clean logged days` : 'Daily estimate not configured'}</Text></View><Text mono tabular style={[styles.amount,{color:colors.accent.successDark}]} weight="700">{habit.financialTracking.enabled ? formatSavedMoney(stats.moneySaved, habit.financialTracking.currency) : '—'}</Text></View>
      <View style={styles.row}><View style={styles.icon}><Clock size={16} color={colors.accent.primary} /></View><View style={{ flex:1 }}><Text weight="600" style={styles.small}>Time Reclaimed</Text><Text color="secondary" style={styles.tiny}>{habit.timeTracking.enabled ? `Based on ${stats.zeroDays} clean logged days` : 'Daily estimate not configured'}</Text></View><Text mono tabular style={[styles.amount,{color:colors.accent.primary}]} weight="700">{habit.timeTracking.enabled ? formatReclaimedTime(stats.hoursSaved) : '—'}</Text></View>
    </View>
  </View>;
}
const baseStyles = StyleSheet.create({
 card:{backgroundColor:colors.background.surface,borderWidth:1,borderColor:colors.border.subtle,borderRadius:24,padding:20,shadowColor:'#302B40',shadowOpacity:.04,shadowRadius:1,shadowOffset:{width:0,height:1},elevation:1},
 header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:14,flexWrap:'wrap'},
 title:{fontSize:14,lineHeight:21},small:{fontSize:12,lineHeight:18},tiny:{fontSize:12,lineHeight:18},
 grid:{flexDirection:'row',flexWrap:'wrap',gap:12},box:{width:'48%',flexGrow:1,borderWidth:1,borderColor:colors.border.subtle,borderRadius:16,padding:12,gap:4},
 label:{fontSize:12,lineHeight:18,letterSpacing:.5},value:{fontSize:20,lineHeight:28},quantityValue:{fontSize:16,lineHeight:24},amount:{fontSize:14,lineHeight:21},
 estimates:{borderTopWidth:1,borderTopColor:colors.background.muted,paddingTop:14,marginTop:12,gap:12},
 row:{flexDirection:'row',gap:10,alignItems:'center',flexWrap:'wrap'},icon:{width:32,height:32,borderRadius:12,backgroundColor:colors.accent.primaryLight,justifyContent:'center',alignItems:'center'},
});
