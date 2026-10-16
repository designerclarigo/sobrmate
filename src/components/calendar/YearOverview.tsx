import React,{useMemo} from 'react';
import {View,StyleSheet,useWindowDimensions} from 'react-native';
import {ChevronLeft,ChevronRight,ChartNoAxesCombined,Beer,GlassWater,Share2,Clock,DollarSign} from 'lucide-react-native';
import Svg,{Rect,Line,Text as SvgText} from 'react-native-svg';
import {colors,useTheme,useThemedStyles} from '../../design-system';
import {CalendarText as Text,CalendarButton,useCalendarBands,CalendarBandId} from './calendarAppearance';
import {CalendarReveal,CalendarPressable} from './CalendarMotion';
import {CheckIn,Habit} from '../../data/types';
import {getTrackingUnit} from '../../data/tracking';
import {calendarStatistics,DAY_LABELS,getCheckInBand,getMonthDays,periodRange,yearLoggedRate,ALCOHOL_BANDS,STATUS_BANDS} from '../../utils/calendar';
import {formatSavedMoney,formatReclaimedTime} from '../../utils/metrics';
import {fontFamilies} from '../../design-system/tokens/typography';

interface Props {habit:Habit;entries:CheckIn[];year:number;today:string;alcohol:boolean;onYear:(year:number)=>void;onBack:()=>void;onMonth:(month:number)=>void;onShare:()=>void}
export function YearOverview({habit,entries,year,today,alcohol,onYear,onBack,onMonth,onShare}:Props){
 const {colors,isDark}=useTheme();const styles=useThemedStyles(baseStyles);const tones=useCalendarBands();const {fontScale,width}=useWindowDimensions();
 const range=periodRange('year',year,0,today,today),stats=calendarStatistics(entries,habit,range.start,range.end,today);
 const relevant=useMemo(()=>entries.filter(e=>e.date>=range.start&&e.date<=range.end),[entries,range.start,range.end]);
 const byDate=useMemo(()=>new Map(relevant.map(e=>[e.date,e])),[relevant]);
 const counts=useMemo(()=>{const result:Record<string,number>={};for(const entry of relevant){const id=getCheckInBand(entry,alcohol).id;result[id]=(result[id]||0)+1;}return result;},[relevant,alcohol]);
 const bands=alcohol?[...ALCOHOL_BANDS,...(counts.used?[STATUS_BANDS[2]]:[])]:STATUS_BANDS;
 const currentYear=Number(today.slice(0,4)),unit=getTrackingUnit(habit),stack=fontScale>1.2||width<350;
 return <CalendarReveal identity={`${habit.id}-year-${year}`}>
  <View style={styles.top}><CalendarPressable onPress={onBack} style={styles.icon} accessibilityRole="button" accessibilityLabel="Back to tracking calendar"><ChevronLeft size={20} color={colors.accent.primary}/></CalendarPressable><Text color="tertiary" weight="600" style={styles.kicker}>YOUR YEAR AT A GLANCE</Text><CalendarPressable onPress={onShare} style={[styles.icon,styles.filled]} accessibilityRole="button" accessibilityLabel="Share your year"><Share2 size={17} strokeWidth={1.6} color={colors.accent.primary}/></CalendarPressable></View>
  <View style={styles.heading}><View style={{flex:1,gap:8}}><View style={styles.metric}>{alcohol?<Beer size={13} color={colors.text.tertiary}/>:<GlassWater size={13} color={colors.text.tertiary}/>}<Text style={[styles.small,{flexShrink:1}]} color="tertiary">{habit.title} · {unit||'daily status'}</Text></View><Text serif weight="400" style={styles.title}>Little moments.{ '\n' }Meaningful progress.</Text></View><View style={[styles.icon,styles.chartBadge]}><ChartNoAxesCombined size={22} strokeWidth={1.5} color={colors.accent.primary}/></View></View>
  <View style={styles.yearNav}><CalendarPressable style={styles.icon} disabled={year<=1900} accessibilityRole="button" accessibilityState={{disabled:year<=1900}} accessibilityLabel="Previous overview year" onPress={()=>onYear(year-1)}><ChevronLeft size={18} color={colors.accent.primary}/></CalendarPressable><Text serif color="accent" style={styles.year}>{year}</Text><CalendarPressable style={[styles.icon,year>=currentYear&&{opacity:.3}]} disabled={year>=currentYear} accessibilityRole="button" accessibilityState={{disabled:year>=currentYear}} accessibilityLabel="Next overview year" onPress={()=>onYear(year+1)}><ChevronRight size={18} color={colors.accent.primary}/></CalendarPressable></View>
  <View style={styles.summary}><View style={styles.summaryHeading}><View style={{flex:1}}><Text color="tertiary" weight="600" style={styles.kicker}>{unit?'ZERO-USE DAYS':'ABSTINENT DAYS'}</Text><Text serif color="accent" tabular style={styles.total}>{stats.zeroDays} <Text color="tertiary" style={styles.unit}>days</Text></Text></View><Text color="accent" style={styles.pill}>{year===currentYear?'Year so far':'Year in review'}</Text></View><View style={[styles.metrics,stack&&{flexDirection:'column'}]}>{[{value:stats.logged,label:'Check-ins'},{value:stats.bestStreak,label:'Best streak · days'},{value:stats.zeroRate===null?'—':`${stats.zeroRate}%`,label:'Zero-use rate'}].map(item=><View key={item.label} style={{flex:1,gap:2}}><Text weight="600" tabular style={styles.metricValue}>{item.value}</Text><Text color="tertiary" style={styles.tiny}>{item.label}</Text></View>)}</View><Text style={[styles.tiny,{marginTop:12}]} color="tertiary">Rate uses logged check-ins. Missing days are never counted as zero.</Text></View>
  <View style={styles.rhythm}><Text serif style={styles.rhythmTitle}>Your daily rhythm</Text><Text style={styles.small} color="tertiary">{yearLoggedRate(stats.logged,year,today)}% logged</Text></View><Text color="tertiary" style={styles.small}>Tap a month to view or edit its check-ins.</Text>
  <View style={styles.months}>{Array.from({length:12},(_,month)=>{
   const days=getMonthDays(year,month),name=new Date(year,month,1,12).toLocaleDateString(undefined,{month:'long'});
   const logged=days.filter(d=>d.inMonth&&byDate.has(d.date)).length;
   return <CalendarPressable key={month} activeOpacity={.8} onPress={()=>onMonth(month)} accessibilityRole="button" accessibilityLabel={`Open ${name} ${year}, ${logged} check-ins`} style={[styles.monthCard,stack&&{width:'100%'}]}>
    <View style={styles.monthTitle}><Text style={styles.small} weight="600">{name}</Text><ChevronRight size={12} color={colors.text.muted}/></View>
    <View style={styles.miniGrid} pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Svg width="100%" height="100%" viewBox="0 0 123 123">
     {DAY_LABELS.map((label,i)=><SvgText key={label} x={i*18+7.5} y={7} fontSize={7} fontFamily={fontFamilies.sans} fill={colors.text.muted} textAnchor="middle">{label[0]}</SvgText>)}
     {Array.from({length:42},(_,index)=>{const day=days[index];if(!day?.inMonth)return null;const entry=byDate.get(day.date),band=entry?getCheckInBand(entry,alcohol):null;const tone=band?tones[band.id as CalendarBandId]:null;const x=index%7*18,y=18+Math.floor(index/7)*18;return <React.Fragment key={day.date}><Rect x={x} y={y} width={15} height={15} rx={3} fill={tone?.color||(day.date>today?(isDark?colors.background.subtle:'#F5F2F7'):colors.background.surface)} stroke={tone?.color||colors.border.subtle} strokeWidth={1}/>{band?.id==='used'&&<Line x1={x+2} y1={y+13} x2={x+13} y2={y+2} stroke="#FFFFFF" strokeWidth={1.5}/>}</React.Fragment>;})}
    </Svg></View><Text color="tertiary" style={styles.tiny}>{logged?`${logged} ${logged===1?'check-in':'check-ins'}`:days.filter(d=>d.inMonth).every(d=>d.date>today)?'Still ahead':'No check-ins'}</Text>
   </CalendarPressable>;
  })}</View>
  <View style={styles.shades}><Text weight="600" style={[styles.small,{marginBottom:12}]}>Every day has a shade</Text><View style={styles.bandGrid}>{bands.map(band=><View key={band.id} style={[styles.bandRow,stack&&{width:'100%'}]}><View style={[styles.swatch,{backgroundColor:tones[band.id as CalendarBandId].color}]}/><Text style={[styles.tiny,{flex:1}]} color="secondary">{band.short}</Text><Text weight="600" tabular style={styles.tiny}>{counts[band.id]||0}</Text></View>)}</View><View style={styles.unlogged}><View style={[styles.swatch,{borderWidth:1,borderColor:colors.border.medium,backgroundColor:colors.background.surface}]}/><Text style={styles.tiny} color="tertiary">Unlogged & future days</Text></View></View>
  <View style={[styles.estimates,stack&&{flexDirection:'column'}]}>{[{title:'Time reclaimed · estimate',Icon:Clock,value:habit.timeTracking.enabled?formatReclaimedTime(stats.hoursSaved):'—'},{title:'Money saved · estimate',Icon:DollarSign,value:habit.financialTracking.enabled?formatSavedMoney(stats.moneySaved,habit.financialTracking.currency):'—'}].map(item=><View key={item.title} style={styles.estimate}><item.Icon size={17} color={colors.accent.primary}/><Text weight="600" style={styles.metricValue} tabular>{item.value}</Text><Text style={styles.tiny} color="tertiary">{item.title}</Text></View>)}</View>
  <Text style={[styles.tiny,{marginTop:8}]} color="tertiary">Estimates use {stats.zeroDays} recorded zero-use days and your daily plan.</Text>
  {!!unit&&<View style={styles.consumption}><View style={{flex:1,gap:4}}><Text weight="600" style={styles.small}>Known consumption total</Text><Text style={styles.tiny} color="tertiary">{(alcohol?stats.unknownCounts:stats.unknownQuantities)?`${alcohol?stats.unknownCounts:stats.unknownQuantities} entries have no amount recorded`:'From recorded quantities only'}</Text></View><Text style={styles.small} color="accent" weight="600">{alcohol?stats.knownDrinks:stats.knownQuantity} {unit}</Text></View>}
  {!stats.logged&&<Text style={styles.empty} color="tertiary" align="center">Your story starts with a check-in.{ '\n' }Open a month to record your first day.</Text>}
  <CalendarButton label="Share your year" fullWidth iconLeft={<Share2 size={16} color={colors.text.inverse}/>} onPress={onShare} style={{marginTop:20}}/>
 </CalendarReveal>;
}
const baseStyles=StyleSheet.create({
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,marginTop:12,marginBottom:20},
 icon:{width:44,height:44,justifyContent:'center',alignItems:'center',borderRadius:14},filled:{backgroundColor:colors.accent.primaryLight},
 kicker:{fontSize:12,lineHeight:18,letterSpacing:1.8,flexShrink:1},
 heading:{flexDirection:'row',alignItems:'center',gap:12},metric:{flexDirection:'row',gap:6,alignItems:'center'},
 small:{fontSize:12,lineHeight:18},tiny:{fontSize:12,lineHeight:18},unit:{fontSize:14,lineHeight:21},
 title:{fontSize:31,lineHeight:35.65,letterSpacing:-1.085},chartBadge:{width:48,height:48,borderRadius:16,backgroundColor:colors.accent.primaryLight},
 yearNav:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderWidth:1,borderColor:colors.border.subtle,backgroundColor:colors.background.surface,borderRadius:16,paddingHorizontal:8,marginTop:20,marginBottom:16},year:{fontSize:24,lineHeight:32},
 summary:{padding:20,borderRadius:24,borderWidth:1,borderColor:colors.accent.primaryBorder,backgroundColor:colors.accent.primaryLight},
 summaryHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:12},
 pill:{fontSize:12,lineHeight:18,paddingVertical:6,paddingHorizontal:10,borderRadius:20,backgroundColor:'#FFFFFFBF',borderWidth:1,borderColor:colors.background.surface},
 total:{fontSize:48,lineHeight:55.2,marginTop:8},metrics:{flexDirection:'row',gap:12,borderTopWidth:1,borderTopColor:colors.accent.primaryBorder,paddingTop:16,marginTop:20},metricValue:{fontSize:18,lineHeight:27},
 rhythm:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12,marginTop:24,marginBottom:12,flexWrap:'wrap'},rhythmTitle:{fontSize:20,lineHeight:28},
 months:{flexDirection:'row',flexWrap:'wrap',gap:12,marginTop:12},monthCard:{width:'48%',flexGrow:1,padding:14,borderWidth:1,borderColor:colors.border.subtle,backgroundColor:colors.background.surface,borderRadius:20},
 monthTitle:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},miniGrid:{width:'100%',aspectRatio:1,marginTop:12,marginBottom:8},
 shades:{marginTop:20,padding:16,borderWidth:1,borderColor:colors.border.subtle,backgroundColor:colors.background.surface,borderRadius:22},
 bandGrid:{flexDirection:'row',flexWrap:'wrap',gap:12},bandRow:{width:'48%',flexGrow:1,flexDirection:'row',alignItems:'center',gap:8},
 swatch:{width:10,height:10,borderRadius:3},unlogged:{flexDirection:'row',alignItems:'center',gap:8,marginTop:12,paddingTop:12,borderTopWidth:1,borderTopColor:colors.background.muted},
 estimates:{flexDirection:'row',gap:12,marginTop:12},estimate:{flex:1,gap:8,padding:16,borderWidth:1,borderColor:colors.border.subtle,borderRadius:22,backgroundColor:colors.background.surface},
 consumption:{flexDirection:'row',alignItems:'center',gap:12,marginTop:16,paddingTop:16,borderTopWidth:1,borderTopColor:colors.border.subtle},empty:{fontSize:12,lineHeight:19.5,marginTop:20},
});
