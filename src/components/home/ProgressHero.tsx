import React, { useState,useRef,useEffect,useMemo } from 'react';
import { View, StyleSheet, Animated, Easing, useWindowDimensions, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { ArrowLeftRight, Beer, Clock3, Leaf, Smartphone, Cigarette, Wind } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Habit } from '../../data/types';
import { isAlcoholTracker } from '../../data/tracking';
import { useHabitDuration } from '../../utils/useHabitDuration';
import { triggerHaptic } from '../../utils/haptics';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { useResponsiveRow } from '../../utils/useResponsiveRow';
import { HomePressable } from './HomePressable';
import { HomePalette, HomeText as Text, useHomeAppearance, useHomeStyles, homeShadows } from './homeAppearance';

interface ProgressHeroProps { habit: Habit; containerStyle?: StyleProp<ViewStyle> }

/** Only this small surface subscribes to the live seconds ticker. */
export function ProgressHero({ habit, containerStyle }: ProgressHeroProps) {
  const palette = useHomeAppearance();
  const styles = useHomeStyles(makeStyles);

  const duration = useHabitDuration(habit.quitDate);
  const [dayView, setDayView] = useState(false);
  const reduced=useReducedMotion();const opacity=useRef(new Animated.Value(1)).current;const {fontScale}=useWindowDimensions();
  const modeOpacity=useRef(new Animated.Value(1)).current;
  const modeTransitioning=useRef(false);
  const footerLayout = useResponsiveRow(2, 136, 8);
  const timeLayout = useResponsiveRow(3, 76, 8);
  const stackCounter = fontScale > 1.25 || duration.days >= 10000;
  useEffect(()=>{if(reduced)return;opacity.setValue(.4);Animated.timing(opacity,{toValue:1,duration:300,useNativeDriver:true}).start();return()=>opacity.stopAnimation();},[duration.days,reduced,opacity]);
  useEffect(()=>()=>modeOpacity.stopAnimation(),[modeOpacity]);
  const units = [{ value: duration.hours, label: 'HOURS' }, { value: duration.minutes, label: 'MINUTES' }, { value: duration.seconds, label: 'SECONDS' }];
  const elapsedInDay = duration.totalSeconds % 86400;
  const progress = elapsedInDay / 86400;
  const HabitIcon = isAlcoholTracker(habit) ? Beer : /cigarette|smok/i.test(habit.title) ? Cigarette
    : habit.iconName === 'Smartphone' ? Smartphone : habit.iconName === 'Wind' ? Wind : Leaf;
  const toggleView = () => {
    if (modeTransitioning.current) return;
    triggerHaptic('selection');
    if (reduced) {
      setDayView(value => !value);
      return;
    }
    modeTransitioning.current = true;
    Animated.timing(modeOpacity, { toValue: 0, duration: 100, useNativeDriver: true }).start(({ finished }) => {
      if (!finished) {
        modeTransitioning.current = false;
        return;
      }
      setDayView(value => !value);
      Animated.timing(modeOpacity, { toValue: 1, duration: 160, useNativeDriver: true }).start(() => {
        modeTransitioning.current = false;
      });
    });
  };
  return <View style={[styles.elevation,containerStyle]}><LinearGradient colors={palette.gradient}
    start={{ x: 0, y: 0 }} end={{ x: 0.84, y: 1 }} style={styles.card}>
    <View pointerEvents="none" accessible={false} style={styles.orbits}>
      <View style={styles.orbitOuter} /><View style={styles.orbitInner} />
    </View>
    <View style={styles.header}>
      <View style={styles.habitCaption}><HabitIcon size={17} strokeWidth={1.6} color={palette.caption} />
        <Text variant="caption" color="accent" numberOfLines={1} style={styles.habitTitle}>{habit.title} free for</Text>
      </View>
      <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveLabel} color="accent">LIVE</Text></View>
    </View>
    <Animated.View style={[styles.daysRow, stackCounter && styles.stackedCounter, {opacity}]} accessible accessibilityLabel={`${duration.days} ${duration.days === 1 ? 'day' : 'days'} since your start`}>
      <Text serif={false} tabular weight="500" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[styles.days, duration.days >= 1000 && styles.longDays]}>{String(duration.days).padStart(2, '0')}</Text>
      <Text variant="caption" color="accent" style={styles.daysLabel}>{duration.days === 1 ? 'day' : 'days'}</Text>
    </Animated.View>
    <Animated.View style={{ opacity: modeOpacity }}>
    {dayView ? <View style={styles.dayProgress}>
      <Text style={styles.progressCaption} color="accent">{duration.hours} {duration.hours === 1 ? 'hour' : 'hours'} into your next day.</Text>
      <View style={styles.progressTrack} accessible accessibilityRole="progressbar" accessibilityLabel="Progress toward your next complete day" accessibilityValue={{ min: 0, max: 24, now: elapsedInDay / 3600 }}>
        <View style={[styles.progressFill, { width: `${Math.max(progress * 100, progress > 0 ? 1 : 0)}%` }]} />
      </View>
      <View style={styles.progressLabels}><Text style={styles.progressLabel} color="secondary">A fresh day</Text><Text style={styles.progressLabel} color="secondary">24 hours</Text></View>
    </View> : <View onLayout={timeLayout.onLayout} style={[styles.timeRow,timeLayout.stacked&&styles.stackedRow]} accessibilityLiveRegion="none">
      {units.map((unit, index) => <View key={unit.label} style={[styles.timeTile, index === 2 && styles.secondsTile, timeLayout.stacked && styles.wideTimeTile]}>
        {index === 2 ? <SecondsDigit value={unit.value} style={styles.timeValue} reduced={reduced} />
          : <Text weight="500" tabular style={styles.timeValue}>{String(unit.value).padStart(2, '0')}</Text>}
        <Text style={[styles.timeLabel, timeLayout.stacked && { marginTop:0 }]} color="secondary">{unit.label}</Text>
      </View>)}
    </View>}
    </Animated.View>
    <View onLayout={footerLayout.onLayout} style={[styles.footer, footerLayout.stacked && styles.stackedRow]}>
      <View style={[styles.footerAction, styles.footerInfo, footerLayout.stacked && styles.wideFooterAction]} accessible={false}>
        <Clock3 size={11} color={palette.precision} strokeWidth={1.6} /><Text style={styles.footerText}>{dayView ? 'Every hour adds up' : 'Live precision ticker'}</Text>
      </View>
      <HomePressable containerStyle={[styles.toggleContainer, footerLayout.stacked && styles.wideToggle]}
        style={[styles.footerAction, footerLayout.stacked ? styles.wideFooterAction : styles.footerToggle]}
        onPress={toggleView} accessibilityRole="switch" accessibilityState={{ checked: dayView }} aria-checked={dayView} accessibilityLabel={dayView ? 'Show live clock' : 'Show compact day view'}>
        <ArrowLeftRight size={13} color={palette.mode} strokeWidth={1.6} /><Text style={[styles.footerText, styles.modeText]}>{dayView ? 'Live clock' : 'Day view'}</Text>
      </HomePressable>
    </View>
  </LinearGradient></View>;
}

function SecondsDigit({ value, style, reduced }: { value: number; style: TextStyle; reduced: boolean }) {
  const reveal = useRef(new Animated.Value(1)).current;
  const motionStyle = useMemo(() => ({ opacity: reveal.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }),
    transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [3, 0] }) }] }), [reveal]);
  useEffect(() => {
    if (reduced) { reveal.setValue(1); return; }
    reveal.setValue(0);
    Animated.timing(reveal, { toValue: 1, duration: 240, useNativeDriver: true,
      easing: Easing.bezier(0.22, 1, 0.36, 1) }).start();
    return () => reveal.stopAnimation();
  }, [value, reduced, reveal]);
  return <Animated.View style={motionStyle}>
    <Text tabular weight="500" style={style}>{String(value).padStart(2, '0')}</Text>
  </Animated.View>;
}

const makeStyles = (p: HomePalette) => StyleSheet.create({
  elevation: { borderRadius: 25, backgroundColor: p.gradient[0], ...homeShadows.hero },
  card: { paddingHorizontal: 20, paddingTop: 20, borderRadius: 25, borderWidth: 1, borderColor: p.heroBorder, overflow: 'hidden' },
  orbits: { position: 'absolute', top: -73, right: -100, width: 245, height: 245 },
  orbitOuter: { position: 'absolute', width: 245, height: 245, borderRadius: 123, borderWidth: 1, borderColor: p.orbit },
  orbitInner: { position: 'absolute', top: 28, left: 28, width: 190, height: 190, borderRadius: 95, borderWidth: 1, borderColor: p.orbit },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  habitCaption: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  habitTitle: { flexShrink: 1, fontSize: 12, lineHeight: 18 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: p.liveDot },
  liveLabel: { fontSize: 12, lineHeight: 18, letterSpacing: 1.5, color: p.live },
  daysRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 9, marginTop: 15, marginBottom: 13 },
  stackedCounter: { flexDirection:'column', alignItems:'center', gap:0 },
  days: { fontSize: 68, lineHeight: 71.4, letterSpacing: -3, color: p.counter, flexShrink:1, maxWidth:'100%' },
  longDays: { fontSize: 56, lineHeight: 65 },
  daysLabel: { flexShrink:0, fontSize: 14, lineHeight: 20, color: p.counterUnit },
  timeRow: { flexDirection: 'row', gap: 8 },
  timeTile: { flex: 1, minWidth: 0, minHeight: 72, backgroundColor:p.tile, borderWidth: 1, borderColor:p.tileBorder, borderRadius: 14, paddingTop: 12, paddingBottom: 9, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  secondsTile: { backgroundColor: p.tileLast },
  stackedRow: { flexDirection:'column' },
  wideTimeTile: { flex:0, width:'100%', minHeight:56, flexDirection:'row', justifyContent:'space-between', paddingHorizontal:16, gap:12 },
  timeValue: { fontSize: 25, lineHeight: 25, fontWeight: '500', letterSpacing: -0.6, color: p.clockValue },
  timeLabel: { fontSize: 12, lineHeight: 17, letterSpacing: 1.2, marginTop: 7, flexShrink:1, color: p.clockLabel },
  dayProgress: { minHeight: 72, justifyContent: 'center', gap: 7 },
  progressCaption: { fontSize: 12, lineHeight: 18 },
  progressTrack: { height: 3, borderRadius: 4, backgroundColor: p.progressTrack, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: p.progressFill },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, lineHeight: 17 },
  footer: { marginTop: 14, borderTopWidth: 1, borderTopColor:p.heroDivider, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap:8 },
  footerAction: { minWidth:0, minHeight:44, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, paddingHorizontal:4 },
  footerInfo: { flex: 1.35, justifyContent:'flex-start', paddingLeft:0, gap: 5 },
  toggleContainer: { flex: 1, minWidth: 0 }, wideToggle: { flex: 0, width: '100%' },
  footerToggle: { justifyContent:'flex-end', paddingRight:0 },
  wideFooterAction: { flex:0, width:'100%', justifyContent:'flex-start', paddingHorizontal:0 },
  footerText: { flexShrink:1, fontSize:12, lineHeight:17, color: p.precision },
  modeText: { color: p.mode },
});
