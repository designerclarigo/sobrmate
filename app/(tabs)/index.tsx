import { useTheme, useThemedStyles } from '../../src/design-system/theme';
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, Check, ChevronRight, Plus, RotateCcw, ShieldCheck } from 'lucide-react-native';
import { Text, Button, BottomSheet, EmptyState, colors } from '../../src/design-system';
import { useRecoveryStore, calculateCleanTime } from '../../src/data/store';
import { AlcoholConsumption, CleanTimeDuration, Habit, CheckInStatus } from '../../src/data/types';
import { ReferenceHomeHeader } from '../../src/components/home/ReferenceHomeHeader';
import { HomeQuickActions } from '../../src/components/home/HomeQuickActions';
import { ProgressHero } from '../../src/components/home/ProgressHero';
import { StreakSummary } from '../../src/components/home/StreakSummary';
import { DailyPledgeCard } from '../../src/components/home/DailyPledgeCard';
import { SavingsCards } from '../../src/components/home/SavingsCards';
import { WeekProgressCard } from '../../src/components/home/WeekProgressCard';
import { IntentionsCard } from '../../src/components/home/IntentionsCard';
import { CheckInModalSheet } from '../../src/components/checkin/CheckInModalSheet';
import { EditTrackerModal } from '../../src/components/tracker-detail/EditTrackerModal';
import { ShareStreakModal } from '../../src/components/tracker-detail/ShareStreakModal';
import { getLocalDateString, formatLocalDate } from '../../src/utils/date';
import { triggerHaptic } from '../../src/utils/haptics';
import { HomePalette, HomeText, useHomeStyles } from '../../src/components/home/homeAppearance';
import { HomePressable } from '../../src/components/home/HomePressable';

interface ShareSnapshot { habit: Habit; duration: CleanTimeDuration; money: number; hours: number }

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const homeStyles = useHomeStyles(makeHomeStyles);

  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const stackHeading = width < 350 || fontScale > 1.2;
  // The rest of the page only needs calendar-day updates; the hero has its own live clock.
  const { habits, activeHabit, checkIns, currentTime, setActiveHabitId, recordCheckIn, updateHabit, resetHabit } = useRecoveryStore('day');
  const today = getLocalDateString(currentTime);
  const habit = activeHabit || habits[0] || null;
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [switchingId, setSwitchingId] = useState('');
  const [switchError, setSwitchError] = useState('');
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [share, setShare] = useState<ShareSnapshot | null>(null);
  const [resetVisible, setResetVisible] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState('');
  const entries = useMemo(() => checkIns.filter(entry => entry.habitId === habit?.id), [checkIns, habit?.id]);
  const selectedEntry = entries.find(entry => entry.date === checkInDate);

  const createTracker = () => { triggerHaptic('light'); setSwitcherVisible(false); router.push('/habit/new'); };
  const openDetails = (id: string) => { triggerHaptic('light'); router.push(`/habit/${id}`); };
  const chooseTracker = async (id: string) => {
    if (switchingId) return;
    triggerHaptic('selection');
    setSwitchError(''); setSwitchingId(id);
    try { await setActiveHabitId(id); setSwitcherVisible(false); }
    catch (error) { setSwitchError(error instanceof Error ? error.message : 'Could not switch trackers. Please try again.'); }
    finally { setSwitchingId(''); }
  };
  const openShare = () => {
    if (!habit) return;
    triggerHaptic('light');
    const duration = calculateCleanTime(habit.quitDate);
    const days = duration.totalSeconds / 86400;
    const zeroUseDays = new Set(entries.filter(entry => entry.status !== 'relapsed').map(entry => entry.date)).size;
    setShare({ habit, duration, money: habit.financialTracking.enabled ? zeroUseDays * habit.financialTracking.costPerDay : 0, hours: habit.timeTracking.enabled ? days * habit.timeTracking.hoursPerDaySaved : 0 });
  };
  const saveCheckIn = async (habitId: string, status: CheckInStatus, notes: string, consumption?: AlcoholConsumption, quantity?:number) => {
    if (!checkInDate) return;
    await recordCheckIn(habitId, status, status === 'struggled' ? 3 : status === 'relapsed' ? 5 : 1, notes, checkInDate, consumption, quantity);
  };
  const confirmReset = () => {
    setResetError('');
    setResetVisible(true);
  };
  const performReset = async () => {
    if (!habit || resetBusy) return;
    setResetBusy(true);
    setResetError('');
    try {
      await resetHabit(habit.id);
      triggerHaptic('medium');
      setResetVisible(false);
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Could not reset your streak. Please try again.');
    } finally {
      setResetBusy(false);
    }
  };

  return <SafeAreaView edges={['top', 'left', 'right']} style={homeStyles.screen}>
    <ReferenceHomeHeader habit={habit} onChooseTracker={() => { setSwitchError(''); setSwitcherVisible(true); }} onNewTracker={createTracker} />
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scrollContent, { paddingBottom: 26 }]}>
      <View style={homeStyles.column}>
        <View style={[styles.editorialHeader, stackHeading && styles.stackedHeading]}>
          <View style={styles.headingCopy}><HomeText weight="600" style={homeStyles.kicker}>ONE DAY AT A TIME</HomeText><HomeText serif weight="400" style={homeStyles.title}>Your progress.</HomeText></View>
          <View style={[styles.date, stackHeading && styles.stackedDate]}><HomeText style={homeStyles.dateText}>{formatLocalDate(today, { weekday: 'long' })}</HomeText><HomeText weight="500" style={homeStyles.dateStrong}>{formatLocalDate(today, { month: 'short', day: 'numeric' })}</HomeText></View>
        </View>
        {habit ? <View style={styles.sections}>
          <ProgressHero habit={habit} containerStyle={styles.heroSpacing} />
          <HomeQuickActions onShare={openShare} onMilestones={() => router.push('/(tabs)/milestones')} />
          <DailyPledgeCard activeHabit={habit} />
          <SavingsCards habit={habit} onConfigure={() => setEditVisible(true)} />
          <StreakSummary habit={habit} entries={entries} today={today} />
          <WeekProgressCard key={`week-${habit.id}`} habit={habit} today={today} entries={entries} onSelectDate={setCheckInDate} onFullView={() => router.push('/(tabs)/calendar')} />
          <IntentionsCard habit={habit} onEdit={() => setEditVisible(true)} />
          {habits.length > 1 && <View style={homeStyles.trackersCard}>
            <View style={styles.trackersHeading}><HomeText weight="500" style={homeStyles.cardTitle}>Your trackers</HomeText><HomeText style={styles.small} color="secondary">{habits.length} active</HomeText></View>
            {habits.map(item => { const days = calculateCleanTime(item.quitDate, currentTime).days; return <TouchableOpacity key={item.id} style={styles.trackerRow} onPress={() => openDetails(item.id)} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={`Open ${item.title} tracker`}><View style={[styles.trackerDot, { backgroundColor: item.accentColor }]} /><View style={styles.trackerCopy}><HomeText variant="body" weight={item.id === habit.id ? '500' : '400'}>{item.title}</HomeText><HomeText style={styles.small} color="secondary">{item.id === habit.id ? 'Your selected tracker' : `${days} ${days === 1 ? 'day' : 'days'} of progress`}</HomeText></View><ChevronRight size={18} strokeWidth={1.4} color={colors.text.secondary} /></TouchableOpacity>; })}
          </View>}
          <View style={homeStyles.resetArea}>
            <HomeText style={homeStyles.resetCopy}>A fresh start is always possible.</HomeText>
            <HomePressable style={homeStyles.resetButton} onPress={confirmReset} accessibilityLabel="Reset streak counter">
              <RotateCcw size={13} color={homeStyles.resetLabel.color} strokeWidth={1.6} />
              <HomeText style={homeStyles.resetLabel}>Reset streak</HomeText>
            </HomePressable>
          </View>
        </View> : <View style={styles.emptyCard}><EmptyState icon={<ShieldCheck size={30} color={colors.accent.primary} strokeWidth={1.5} />} title="Your fresh start." description="Choose a habit, set an intention, and make a little room for yourself." actionLabel="Create your first tracker" onAction={createTracker} /></View>}
      </View>
    </ScrollView>
    <BottomSheet visible={switcherVisible} onClose={() => { if (!switchingId) setSwitcherVisible(false); }} title="Choose your focus." subtitle="One intention at a time." footer={<Button label="Add a new tracker" variant="outline" iconLeft={<Plus size={16} color={colors.accent.primary} />} disabled={!!switchingId} onPress={createTracker} fullWidth />}>
      {habits.length ? habits.map(item => <TouchableOpacity key={item.id} style={[styles.selectionRow, item.id === habit?.id && styles.selectionActive]} onPress={() => { void chooseTracker(item.id); }} disabled={!!switchingId} activeOpacity={0.7} accessibilityRole="button" accessibilityState={{ selected: item.id === habit?.id, disabled: !!switchingId }} accessibilityLabel={`Select ${item.title}`}><View style={[styles.trackerDot, { backgroundColor: item.accentColor }]} /><View style={styles.trackerCopy}><Text variant="body" weight={item.id === habit?.id ? '500' : '400'}>{item.title}</Text><Text variant="subcaption" color="secondary">{calculateCleanTime(item.quitDate, currentTime).days} days of progress</Text></View>{switchingId === item.id ? <ActivityIndicator color={colors.accent.primary} size="small" /> : item.id === habit?.id ? <Check size={18} color={colors.accent.primary} /> : <ArrowRight size={16} color={colors.text.tertiary} />}</TouchableOpacity>) : <Text color="secondary" style={styles.noTrackers}>Create a tracker to begin your journey.</Text>}
      {!!switchError && <Text variant="caption" color="rose" accessibilityRole="alert">{switchError}</Text>}
    </BottomSheet>
    <BottomSheet visible={resetVisible} onClose={() => { if (!resetBusy) setResetVisible(false); }} title="Reset your streak?" subtitle="Your tracker and past check-ins will stay. Your best streak will be preserved." footer={<View style={{ gap: 10 }}>
      <Button label="Keep my streak" variant="outline" disabled={resetBusy} onPress={() => setResetVisible(false)} fullWidth />
      <Button label="Reset streak" variant="danger" loading={resetBusy} onPress={() => void performReset()} fullWidth />
    </View>}>
      {!!resetError && <Text color="rose" accessibilityRole="alert">{resetError}</Text>}
    </BottomSheet>
    {!!checkInDate && habit && <CheckInModalSheet visible onClose={() => setCheckInDate(null)} habit={habit} dateStr={checkInDate} existingCheckIn={selectedEntry} onSave={saveCheckIn} />}
    {editVisible && habit && <EditTrackerModal visible onClose={() => setEditVisible(false)} habit={habit} onSave={updates => updateHabit(habit.id, updates)} />}
    {share && <ShareStreakModal visible onClose={() => setShare(null)} habit={share.habit} cleanTime={share.duration} longestStreak={Math.max(share.habit.longestStreakDays, share.duration.days)} moneySaved={share.money} hoursSaved={share.hours} />}
  </SafeAreaView>;
}

const baseStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background.canvas },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  editorialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 24, paddingBottom: 18 },
  stackedHeading: { flexDirection: 'column', alignItems: 'flex-start' },
  headingCopy: { flex: 1, gap: 7 },
  date: { alignItems: 'flex-end', gap: 3, flexShrink: 0 },
  stackedDate: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap:'wrap' },
  sections: { gap: 18 },
  heroSpacing: { marginBottom: -6 },
  small: { fontSize: 13, lineHeight: 18 },
  trackersHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, gap:12 },
  trackerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderTopWidth: 1, borderTopColor: colors.border.subtle },
  trackerCopy: { flex: 1, gap: 3 },
  trackerDot: { width: 8, height: 8, borderRadius: 4 },
  selectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 15, padding: 15, marginBottom: 8, minHeight: 65, borderWidth: 1, borderColor: colors.border.subtle },
  selectionActive: { backgroundColor: colors.accent.primaryLight, borderColor: colors.accent.primaryBorder },
  noTrackers: { paddingVertical: 18 },
  emptyCard: { padding: 20, borderWidth: 1, borderColor: colors.border.subtle, borderRadius: 25, backgroundColor: colors.background.surface },
});

const makeHomeStyles = (p: HomePalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: p.canvas },
  column: { width: '100%', maxWidth: 400, alignSelf: 'center', paddingHorizontal: 22 },
  kicker: { fontSize: 12, lineHeight: 17, letterSpacing: 1.65, color: p.eyebrow },
  title: { fontSize: 30, lineHeight: 36, letterSpacing: -0.9, color: p.ink },
  dateText: { fontSize: 12, lineHeight: 19.8, color: p.date },
  dateStrong: { fontSize: 12, lineHeight: 18, color: p.dateStrong },
  trackersCard: { backgroundColor:p.surface, borderWidth:1, borderColor:p.border, borderRadius:22, padding:17 },
  cardTitle: { flex:1, fontSize:14, lineHeight:21, letterSpacing:-0.25, color:p.heading },
  resetArea: { flexDirection:'row', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:10,
    borderTopWidth:1, borderTopColor:p.weekDivider, paddingTop:15, marginTop:2 },
  resetCopy: { flex:1, minWidth:100, fontSize:12, lineHeight:18, color:p.muted },
  resetButton: { minHeight:44, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6,
    paddingHorizontal:11, borderWidth:1, borderColor:p.resetBorder, borderRadius:12, backgroundColor:p.resetSurface },
  resetLabel: { fontSize:12, lineHeight:18, color:p.reset },
});
