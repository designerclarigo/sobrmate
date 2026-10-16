import { useTheme, useThemedStyles } from '../../src/design-system/theme';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View,useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Beer, ChartNoAxesCombined, ChevronLeft, ChevronRight, GlassWater, Plus, RotateCcw, SlidersHorizontal } from 'lucide-react-native';
import { EmptyState, Modal, colors } from '../../src/design-system';
import { CalendarAppearance, CalendarText as Text, CalendarButton as Button } from '../../src/components/calendar/calendarAppearance';
import { CalendarReveal, CalendarPressable } from '../../src/components/calendar/CalendarMotion';
import { useRecoveryStore } from '../../src/data/store';
import { AlcoholConsumption, CheckInStatus } from '../../src/data/types';
import { isAlcoholTracker,getTrackingUnit } from '../../src/data/tracking';
import { CheckInModalSheet } from '../../src/components/checkin/CheckInModalSheet';
import { TrackerHeader } from '../../src/components/calendar/TrackerHeader';
import { MonthCalendar } from '../../src/components/calendar/MonthCalendar';
import { CalendarStatistics } from '../../src/components/calendar/CalendarStatistics';
import { TrackingRulesModal } from '../../src/components/calendar/TrackingRulesModal';
import { YearOverview } from '../../src/components/calendar/YearOverview';
import { YearShareModal } from '../../src/components/calendar/YearShareModal';
import { calendarStatistics, latestCheckIns, periodRange, StatisticsPeriod } from '../../src/utils/calendar';
import { formatLocalDate, getLocalDateString, parseLocalDate } from '../../src/utils/date';
import { triggerHaptic } from '../../src/utils/haptics';
import { useReducedMotion } from '../../src/utils/useReducedMotion';
import { usePremium } from '../../src/data/premium';
import { CategoryBreakdown } from '../../src/components/calendar/CategoryBreakdown';
import { AdvancedStatistics } from '../../src/components/calendar/AdvancedStatistics';

const PERIODS: { id:StatisticsPeriod; label:string }[] = [{ id:'week', label:'Week' }, { id:'month', label:'Month' }, { id:'year', label:'Year' }, { id:'all', label:'All Time' }];

export default function CalendarScreen() {
  return <CalendarAppearance><CalendarContent /></CalendarAppearance>;
}

function CalendarContent() {
  const { colors,isDark } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const router = useRouter();
  const premium=usePremium();
  const [insights,setInsights]=useState(false);
  const {fontScale,width}=useWindowDimensions();const stackHeading=fontScale>1.2||width<330;const extraNavigationSpace=Math.max(0,fontScale-1)*70;
  const reducedMotion = useReducedMotion();
  const scroll = useRef<ScrollView>(null);
  const { activeHabit, habits, checkIns, currentTime, recordCheckIn, resetHabit } = useRecoveryStore('day');
  const habit = activeHabit || habits[0] || null;
  const today = getLocalDateString(currentTime);
  const [monthDate, setMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12));
  const [selected, setSelected] = useState(today);
  const [period, setPeriod] = useState<StatisticsPeriod>('month');
  const [overview, setOverview] = useState(false);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [rules, setRules] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [restart, setRestart] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [restartError, setRestartError] = useState('');
  const restartInFlight = useRef(false);
  const entries = useMemo(() => latestCheckIns(checkIns, habit?.id || '', today), [checkIns, habit?.id, today]);
  const alcohol = !!habit && isAlcoholTracker(habit);
  const viewYear = monthDate.getFullYear();
  const viewMonth = monthDate.getMonth();
  const range = periodRange(period, viewYear, viewMonth, selected, today);
  const stats = habit ? calendarStatistics(entries, habit, range.start, range.end, today) : null;
  const monthLabel = monthDate.toLocaleDateString(undefined, { month:'long', year:'numeric' });
  const currentMonth=viewYear===currentTime.getFullYear()&&viewMonth===currentTime.getMonth();
  const goToday=()=>{setMonthDate(new Date(currentTime.getFullYear(),currentTime.getMonth(),1,12));setSelected(today);scrollTop();triggerHaptic('selection');};
  useEffect(() => { setCheckInDate(null); setRules(false); setSharing(false); setRestart(false); setRestartError(''); }, [habit?.id]);
  const scrollTop = () => scroll.current?.scrollTo({ y:0, animated:!reducedMotion });
  const showOverview = () => { if(!premium.canAccess('year_heatmap')){premium.openPaywall('year_heatmap');return;}setYear(viewYear > Number(today.slice(0,4)) ? Number(today.slice(0,4)) : viewYear); setOverview(true); scrollTop(); triggerHaptic('light'); };
  useEffect(()=>{if(!premium.isLoading&&!premium.isPremium){setOverview(false);setSharing(false);if(period==='year'||period==='all')setPeriod('month');}},[premium.isPremium,premium.isLoading,period]);
  const choosePeriod=(next:StatisticsPeriod)=>{const feature=next==='year'?'year_heatmap':next==='all'?'deep_archive':null;if(feature&&!premium.canAccess(feature)){premium.openPaywall(feature);return;}setPeriod(next);triggerHaptic('selection');};
  const moveMonth = (delta:number) => {
    const next = new Date(viewYear, viewMonth + delta, 1, 12);
    if (next.getFullYear() < 1900 || next.getFullYear() > Number(today.slice(0,4)) + 1) return;
    triggerHaptic('selection'); setMonthDate(next);
    const start = getLocalDateString(next);
    const end = getLocalDateString(new Date(next.getFullYear(), next.getMonth() + 1, 0, 12));
    setSelected(today >= start && today <= end ? today : end < today ? end : start); scrollTop();
  };
  const selectDate = (date:string) => {
    if (date > today) return;
    const parsed = parseLocalDate(date);
    setSelected(date); setMonthDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1, 12));
    setCheckInDate(date); triggerHaptic('selection');
  };
  const openMonth = (month:number) => {
    setMonthDate(new Date(year, month, 1, 12));
    const start = getLocalDateString(new Date(year, month, 1, 12));
    const end = getLocalDateString(new Date(year, month + 1, 0, 12));
    setSelected(today >= start && today <= end ? today : end < today ? end : start);
    setOverview(false); setPeriod('month'); scrollTop();
  };
  const save = async (id:string, status:CheckInStatus, notes:string, consumption?:AlcoholConsumption, quantity?:number) => {
    if (!checkInDate) throw new Error('Choose a check-in date.');
    await recordCheckIn(id, status, status === 'struggled' ? 3 : status === 'relapsed' ? 5 : 1, notes, checkInDate, consumption, quantity);
  };
  const reset = async () => {
    if (!habit || restartInFlight.current) return;
    restartInFlight.current = true; setRestarting(true); setRestartError('');
    try { await resetHabit(habit.id); setRestart(false); }
    catch (error) { setRestartError(error instanceof Error ? error.message : 'Could not restart. Please try again.'); }
    finally { restartInFlight.current = false; setRestarting(false); }
  };
  const rangeLabel = period === 'all' ? 'All saved check-ins' : period === 'month' ? monthLabel : period === 'year' ? String(viewYear) : `${formatLocalDate(range.start, { month:'short', day:'numeric' })} – ${formatLocalDate(range.end, { month:'short', day:'numeric' })}`;
  return <SafeAreaView edges={['top','left','right']} style={styles.screen}>
    <TrackerHeader reference habit={habit} />
    <ScrollView ref={scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom:112 + extraNavigationSpace }}>
      <View style={[styles.column,overview&&styles.annualColumn]}>
        {!habit ? <View style={{ marginTop:40 }}><EmptyState title="Your story starts here" description="Create a tracker to begin your daily calendar." actionLabel="Create my first tracker" onAction={() => router.push('/habit/new')} /></View> : overview ? <YearOverview habit={habit} entries={entries} year={year} today={today} alcohol={alcohol} onYear={next=>{setYear(next);scrollTop();triggerHaptic('selection');}} onBack={() => { setOverview(false); scrollTop(); }} onMonth={openMonth} onShare={() => setSharing(true)} /> : <>
          <View style={[styles.heading,stackHeading&&styles.stackedHeading]}><View style={{flex:1,gap:2}}><Text weight="700" style={styles.title} accessibilityRole="header">Tracking Calendar</Text><View style={styles.metric}>{alcohol?<Beer size={13} strokeWidth={1.6} color={colors.text.tertiary}/>:<GlassWater size={13} color={colors.text.tertiary}/>}<Text color="secondary" style={[styles.small,{flexShrink:1}]}><Text color="accent" weight="600" style={styles.small}>{habit.title}</Text> · {getTrackingUnit(habit)||'daily status'}</Text></View></View><CalendarPressable onPress={()=>setRules(true)} accessibilityRole="button" accessibilityLabel="Open tracking rules" style={styles.rules}><SlidersHorizontal size={14} color={colors.accent.primary}/><Text color="accent" weight="600" style={styles.small}>Rules</Text></CalendarPressable></View>
          <CalendarPressable activeOpacity={0.8} style={styles.banner} onPress={showOverview} accessibilityRole="button" accessibilityLabel="Your year at a glance"><View style={styles.bannerIcon}><ChartNoAxesCombined size={20} strokeWidth={1.6} color={colors.accent.primary}/></View><View style={{flex:1,gap:2}}><Text weight="600" color="accent" style={styles.bannerTitle}>Your year at a glance</Text><Text color="tertiary" style={styles.tiny}>Daily colors. Meaningful stats. A card to share.</Text></View><ChevronRight size={17} color={colors.accent.primary}/></CalendarPressable>
          <View style={styles.monthNav}><CalendarPressable onPress={()=>moveMonth(-1)} accessibilityRole="button" accessibilityLabel="Previous month" style={styles.arrow}><ChevronLeft size={20} strokeWidth={1.6} color={colors.accent.primary}/></CalendarPressable><View style={styles.monthTitle}><Text weight="700" style={styles.monthLabel}>{monthLabel}</Text>{!currentMonth&&<CalendarPressable style={styles.todayButton} onPress={goToday} accessibilityRole="button" accessibilityLabel="Return to current month"><Text weight="600" color="accent" style={styles.tiny}>Today</Text></CalendarPressable>}</View><CalendarPressable onPress={()=>moveMonth(1)} accessibilityRole="button" accessibilityLabel="Next month" style={styles.arrow}><ChevronRight size={20} strokeWidth={1.6} color={colors.accent.primary}/></CalendarPressable></View>
          <CalendarReveal identity={`${habit.id}-${viewYear}-${viewMonth}`}><MonthCalendar year={viewYear} month={viewMonth} today={today} selected={selected} entries={entries} alcohol={alcohol} onSelect={selectDate}/></CalendarReveal>
          <View style={styles.tabs} accessibilityRole="tablist">{PERIODS.map(item=><CalendarPressable key={item.id} onPress={()=>choosePeriod(item.id)} activeOpacity={0.8} accessibilityRole="tab" accessibilityLabel={`${item.label} statistics${!premium.isPremium&&(item.id==='year'||item.id==='all')?', Premium preview':''}`} accessibilityState={{selected:period===item.id}} style={[styles.tab,period===item.id&&styles.tabActive]}><Text style={styles.small} weight="600" color={period===item.id?'inverse':'secondary'}>{item.label}</Text></CalendarPressable>)}</View>
          {stats && <CalendarReveal identity={`${habit.id}-${period}-${range.start}-${range.end}`}><CalendarStatistics stats={stats} period={period} habit={habit} alcohol={alcohol} rangeLabel={rangeLabel}/><CategoryBreakdown entries={entries} habit={habit} start={range.start} end={range.end} today={today}/></CalendarReveal>}
          <Button label="Explore advanced insights" variant="outline" style={{marginTop:24}} onPress={()=>setInsights(true)}/>
          <Text color="tertiary" style={styles.footerNote}>Small choices. A fuller life.</Text>
        </>}
      </View>
    </ScrollView>
    {habit && !overview && <View pointerEvents="box-none" style={[styles.floating, { bottom:16 }]}><CalendarPressable style={styles.checkIn} accessibilityRole="button" accessibilityLabel="Check in for today" onPress={() => { setSelected(today); setMonthDate(new Date(currentTime.getFullYear(), currentTime.getMonth(), 1, 12)); setCheckInDate(today); }}><Plus size={18} color={colors.text.inverse} /><Text color="inverse" weight="600" style={styles.small}>Check In</Text></CalendarPressable><CalendarPressable style={[styles.restart,{backgroundColor:isDark?colors.status.danger:'#E05353'}]} accessibilityRole="button" accessibilityLabel="Restart the selected tracker" onPress={() => setRestart(true)}><RotateCcw size={20} strokeWidth={1.7} color={colors.text.inverse} /></CalendarPressable></View>}
    {habit && rules && <TrackingRulesModal visible onClose={() => setRules(false)} habit={habit} />}
    {habit && checkInDate && <CheckInModalSheet calendarAppearance visible habit={habit} dateStr={checkInDate} existingCheckIn={entries.find(entry => entry.date === checkInDate)} onClose={() => setCheckInDate(null)} onSave={save} />}
    {habit && sharing && <YearShareModal visible onClose={() => setSharing(false)} habit={habit} entries={entries} year={year} today={today} />}
    <AdvancedStatistics visible={insights} onClose={()=>setInsights(false)}/>
    {habit && <Modal visible={restart} onClose={() => { if (!restarting) setRestart(false); }} title="Begin a fresh start?" description="This records a use entry for today and restarts the live timer. Your earlier check-ins and best streak stay saved." actions={<View style={{ gap:8 }}>{!!restartError && <Text accessibilityRole="alert" color="rose" variant="caption">{restartError}</Text>}<Button label="Restart tracker" variant="danger" loading={restarting} onPress={reset} fullWidth /><Button label="Keep my progress" variant="ghost" disabled={restarting} onPress={() => setRestart(false)} fullWidth /></View>} />}
  </SafeAreaView>;
}
const baseStyles = StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background.canvas},
  column:{width:'100%',maxWidth:400,alignSelf:'center',paddingHorizontal:16},annualColumn:{paddingHorizontal:20},
  heading:{flexDirection:'row',alignItems:'center',gap:12,paddingTop:12,paddingBottom:16,paddingHorizontal:4},
  stackedHeading:{flexDirection:'column',alignItems:'flex-start'},title:{fontSize:18,lineHeight:27},
  metric:{flexDirection:'row',gap:6,alignItems:'center'},small:{fontSize:12,lineHeight:18},tiny:{fontSize:12,lineHeight:18},
  rules:{flexDirection:'row',gap:6,alignItems:'center',justifyContent:'center',minHeight:44,paddingHorizontal:12,borderWidth:1,borderColor:colors.border.subtle,borderRadius:16,backgroundColor:colors.background.surface},
  banner:{flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderColor:colors.accent.primaryBorder,backgroundColor:colors.accent.primaryLight,borderRadius:22,padding:16},
  bannerIcon:{width:40,height:40,borderRadius:12,backgroundColor:'#FFFFFFB3',justifyContent:'center',alignItems:'center'},bannerTitle:{fontSize:14,lineHeight:21},
  monthNav:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingTop:20,paddingBottom:16,paddingHorizontal:8},
  arrow:{height:44,width:44,alignItems:'center',justifyContent:'center',borderRadius:12},monthLabel:{fontSize:14,lineHeight:21},
  monthTitle:{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:8,flexWrap:'wrap'},
  todayButton:{minHeight:44,paddingHorizontal:8,borderRadius:20,backgroundColor:colors.accent.primaryLight,justifyContent:'center'},
  tabs:{flexDirection:'row',gap:6,marginTop:16,marginBottom:16,paddingHorizontal:2},
  tab:{flex:1,minHeight:44,backgroundColor:colors.background.surface,borderWidth:1,borderColor:colors.border.subtle,borderRadius:16,justifyContent:'center',alignItems:'center',paddingHorizontal:3,paddingVertical:8},
  tabActive:{backgroundColor:colors.accent.primary,borderColor:colors.accent.primary},
  floating:{position:'absolute',right:0,left:0,maxWidth:400,width:'100%',alignSelf:'center',paddingHorizontal:16,flexDirection:'row',justifyContent:'flex-end',gap:8,zIndex:20},
  checkIn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,borderRadius:24,minHeight:48,paddingHorizontal:19,backgroundColor:colors.accent.primary,shadowColor:colors.accent.primary,shadowOpacity:.17,shadowRadius:8,shadowOffset:{width:0,height:4},elevation:3},
  restart:{width:48,height:48,borderRadius:24,backgroundColor:colors.status.danger,alignItems:'center',justifyContent:'center',shadowColor:colors.status.danger,shadowOpacity:.16,shadowRadius:8,shadowOffset:{width:0,height:4},elevation:3},
  footerNote:{fontSize:12,lineHeight:18,textAlign:'center',marginTop:23},
});
