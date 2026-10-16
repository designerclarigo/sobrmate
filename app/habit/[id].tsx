import { useTheme, useThemedStyles } from '../../src/design-system/theme';
import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Award,
  DollarSign,
  Clock,
  Flame,
  Calendar as CalendarIcon,
  CheckCircle2,
  Sparkles,
  Edit3,
  Share2,
  Droplets,
  Wind,
  Smartphone,
  Leaf,
  Zap,
  Heart,
  Smile,
  Compass,
  Sun,
  FileText,
  Plus,
  Sliders,
} from 'lucide-react-native';
import {
  ScreenContainer,
  Text,
  Card,
  Button,
  IconButton,
  Header,
  StatCard,
  SectionHeader,
  Input,
  BottomSheet,
  Modal,
  StatusChip,
  colors,
  spacing,
  radii,
  shadows,
} from '../../src/design-system';
import { useRecoveryStore } from '../../src/data/store';
import { LiveCleanTimer } from '../../src/components/tracker-detail/LiveCleanTimer';
import { TrackerCalendarPreview } from '../../src/components/tracker-detail/TrackerCalendarPreview';
import { EditTrackerModal } from '../../src/components/tracker-detail/EditTrackerModal';
import { ShareStreakModal } from '../../src/components/tracker-detail/ShareStreakModal';
import { CheckInModalSheet } from '../../src/components/checkin/CheckInModalSheet';
import { getLocalDateString } from '../../src/utils/date';
import { triggerHaptic } from '../../src/utils/haptics';
import { AlcoholConsumption, Habit } from '../../src/data/types';

export default function HabitDetailScreen({
  habitIdOverride,
  onGoBack,
}: {
  habitIdOverride?: string;
  onGoBack?: () => void;
} = {}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const router = useRouter();
  const searchParams = useLocalSearchParams<{ id: string }>();
  const habitId = habitIdOverride || searchParams.id;

  const {
    habits,
    checkIns,
    currentTime,
    getHabitCleanTime,
    getHabitNextMilestone,
    resetHabit,
    recordCheckIn,
    updateHabit,
    deleteHabit,
  } = useRecoveryStore('second');

  const habit = habits.find((h) => h.id === habitId);

  // Modals state
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [checkInSheetVisible, setCheckInSheetVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [editingNoteText, setEditingNoteText] = useState(habit?.notes || '');
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  if (!habit) {
    return (
      <ScreenContainer>
        <Header
          title="Tracker Not Found"
          leftSlot={
            <IconButton
              icon={<ArrowLeft size={20} color={colors.text.primary} />}
              onPress={() => (onGoBack ? onGoBack() : router.back())}
            />
          }
        />
        <Card variant="default" padding="lg" style={{ marginTop: 24 }}>
          <Text variant="body" color="secondary" align="center">
            This tracker has been removed or does not exist.
          </Text>
        </Card>
      </ScreenContainer>
    );
  }

  // Real calculated time from stored quitDate
  const cleanTime = getHabitCleanTime(habit.quitDate);
  const streakDays = cleanTime.days;
  const nextMilestone = getHabitNextMilestone(streakDays);

  const targetDays = nextMilestone ? nextMilestone.targetDays : 365;
  const milestoneProgress = Math.min(streakDays / targetDays, 1);
  const daysRemaining = nextMilestone ? Math.max(0, nextMilestone.targetDays - streakDays) : 0;

  // Real financial savings calculated from stored costPerDay
  const moneySaved = habit.financialTracking.enabled
    ? Math.round((cleanTime.totalSeconds / 86400) * habit.financialTracking.costPerDay * 100) / 100
    : 0;

  // Real hours reclaimed calculated from stored hoursPerDaySaved
  const hoursSaved = habit.timeTracking.enabled
    ? Math.round((cleanTime.totalSeconds / 86400) * habit.timeTracking.hoursPerDaySaved * 10) / 10
    : 0;

  // Longest streak
  const longestStreak = Math.max(habit.longestStreakDays, streakDays);
  const isPersonalRecord = streakDays >= longestStreak && streakDays > 0;

  const startedDateFormatted = new Date(habit.quitDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleConfirmReset = async () => {
    triggerHaptic('medium');
    await resetHabit(
      habit.id,
      resetReason.trim() || 'Mindful restart. Every beginning carries wisdom and courage.'
    );
    setResetModalVisible(false);
    setResetReason('');
  };

  const todayStr = getLocalDateString(currentTime);
  const todayCheckIn = checkIns.find((c) => c.habitId === habit.id && c.date === todayStr);

  const handleSaveCheckInFromSheet = async (
    habitId: string,
    status: 'clean' | 'struggled' | 'relapsed',
    notes: string,
    consumption?: AlcoholConsumption, quantity?:number
  ) => {
    await recordCheckIn(
      habitId,
      status,
      status === 'struggled' ? 3 : status === 'relapsed' ? 5 : 1,
      notes,
      todayStr,
      consumption,quantity
    );
  };

  const handleSaveNote = async () => {
    triggerHaptic('light');
    await updateHabit(habit.id, { notes: editingNoteText.trim() });
    setNoteModalVisible(false);
  };

  const handleSaveHabitUpdates = async (updates: Partial<Habit>) => {
    await updateHabit(habit.id, updates);
  };

  const handleDeleteHabit = async (id: string) => {
    await deleteHabit(id);
    if (onGoBack) {
      onGoBack();
    } else {
      if (router.canGoBack()) router.back(); else router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    triggerHaptic('light');
    if (onGoBack) {
      onGoBack();
    } else {
      router.back();
    }
  };

  // Habit icon renderer
  const renderHabitIcon = (name: string, color: string, size = 22) => {
    const props = { size, color, strokeWidth: 2 };
    switch (name) {
      case 'GlassWater':
        return <Droplets {...props} />;
      case 'Wind':
        return <Wind {...props} />;
      case 'Smartphone':
        return <Smartphone {...props} />;
      case 'Leaf':
        return <Leaf {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'Heart':
        return <Heart {...props} />;
      case 'Smile':
        return <Smile {...props} />;
      case 'Sun':
        return <Sun {...props} />;
      case 'Award':
        return <Award {...props} />;
      default:
        return <ShieldCheck {...props} />;
    }
  };

  const improvementsList = habit.improvements && habit.improvements.length > 0
    ? habit.improvements
    : ['Mental Clarity', 'Deep Sleep', 'Emotional Peace'];

  return (
    <ScreenContainer>
      {/* Top App Header Contract */}
      <Header
        kicker={`${habit.category.toUpperCase()} • STARTED ${startedDateFormatted}`}
        title={habit.title}
        leftSlot={
          <IconButton
            icon={<ArrowLeft size={20} color={colors.text.primary} />}
            onPress={handleBack}
            size={40}
            variant="filled"
            accessibilityLabel="Back to Home"
          />
        }
        rightSlot={
          <View style={styles.topRightActions}>
            <IconButton
              icon={<Share2 size={18} color={colors.text.primary} />}
              onPress={() => {
                triggerHaptic('light');
                setShareModalVisible(true);
              }}
              size={38}
              variant="filled"
              accessibilityLabel="Share streak"
            />
            <IconButton
              icon={<Sliders size={18} color={colors.text.primary} />}
              onPress={() => {
                triggerHaptic('light');
                setEditModalVisible(true);
              }}
              size={38}
              variant="filled"
              accessibilityLabel="Edit tracker"
            />
          </View>
        }
      />

      <View style={{ height: spacing.base }} />

      {/* Habit Overview Card */}
      <Card variant="default" padding="lg" style={styles.habitOverviewCard}>
        <View style={styles.habitHeaderRow}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: habit.accentColor ? `${habit.accentColor}18` : colors.accent.primaryLight },
            ]}
          >
            {renderHabitIcon(habit.iconName, habit.accentColor || colors.accent.primary, 24)}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleStreakRow}>
              <Text variant="title3" color="primary" weight="500">
                {habit.title}
              </Text>
              {isPersonalRecord && (
                <StatusChip label="Personal Record" tone="primary" size="sm" />
              )}
            </View>
            <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
              {habit.resetsCount === 0
                ? 'Pristine momentum • Zero resets'
                : `${habit.resetsCount} mindful restart${habit.resetsCount > 1 ? 's' : ''} weathered`}
            </Text>
          </View>
        </View>
      </Card>

      <View style={{ height: spacing.base }} />

      {/* REQUIREMENT: Live Clean Timer (Days / Hours / Minutes / Seconds) */}
      <LiveCleanTimer
        quitDateISO={habit.quitDate}
        accentColor={habit.accentColor || colors.accent.primary}
      />

      <View style={{ height: spacing.base }} />

      {/* Core Statistics 2x2 Grid */}
      <View style={styles.statsGrid}>
        {/* Current Streak */}
        <View style={styles.statGridCol}>
          <StatCard
            label="Current Streak"
            value={`${streakDays}d`}
            unit="days"
            subtitle={`${cleanTime.hours}h ${cleanTime.minutes}m ongoing`}
            icon={<ShieldCheck size={16} color={habit.accentColor || colors.accent.primary} />}
            accentColor={habit.accentColor || colors.accent.primary}
          />
        </View>

        {/* Longest Streak */}
        <View style={styles.statGridCol}>
          <StatCard
            label="Longest Streak"
            value={`${longestStreak}d`}
            unit="days"
            subtitle={isPersonalRecord ? 'Active record pace' : 'Historical record'}
            icon={<Flame size={16} color={colors.accent.amber} />}
            accentColor={colors.accent.amber}
          />
        </View>

        {/* Total Money Saved */}
        <View style={styles.statGridCol}>
          <StatCard
            label="Total Saved"
            value={habit.financialTracking.enabled ? `${habit.financialTracking.currency}${moneySaved}` : '$0'}
            unit={habit.financialTracking.currency || '$'}
            subtitle={
              habit.financialTracking.enabled
                ? `$${habit.financialTracking.costPerDay}/day pace`
                : 'Tracking off'
            }
            icon={<DollarSign size={16} color={colors.accent.success} />}
            accentColor={colors.accent.success}
          />
        </View>

        {/* Total Time Saved */}
        <View style={styles.statGridCol}>
          <StatCard
            label="Time Reclaimed"
            value={habit.timeTracking.enabled ? `${hoursSaved}h` : '0h'}
            unit="hours"
            subtitle={
              habit.timeTracking.enabled
                ? `${habit.timeTracking.hoursPerDaySaved}h/day returned`
                : 'Tracking off'
            }
            icon={<Clock size={16} color={colors.accent.sky} />}
            accentColor={colors.accent.sky}
          />
        </View>
      </View>

      <View style={{ height: spacing.lg }} />

      {/* REQUIREMENT: Next Milestone */}
      <SectionHeader
        kicker="MILESTONE HORIZON"
        title="Next Milestone"
        rightSlot={
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              router.push('/milestone');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text variant="caption" color="accent" weight="500">
              View All →
            </Text>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          triggerHaptic('light');
          router.push('/milestone');
        }}
      >
        <Card variant="default" padding="lg" style={styles.milestoneCard}>
        <View style={styles.milestoneHeaderRow}>
          <View style={styles.milestoneIconCircle}>
            <Award size={22} color={colors.accent.amber} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="bodyMedium" color="primary" weight="500">
                {nextMilestone ? nextMilestone.title : 'Full Bloom Achieved'}
              </Text>
              <Text variant="caption" color="accent" weight="500" tabular>
                {Math.round(milestoneProgress * 100)}%
              </Text>
            </View>
            <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
              {nextMilestone
                ? `${targetDays} Days Target • ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`
                : 'All standard milestones unlocked'}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.round(milestoneProgress * 100)}%`,
                backgroundColor: habit.accentColor || colors.accent.primary,
              },
            ]}
          />
        </View>

        {/* Milestone Affirmation */}
        {nextMilestone?.affirmation && (
          <View style={styles.milestoneAffirmationBox}>
            <Sparkles size={14} color={colors.accent.amber} />
            <Text variant="caption" color="secondary" style={styles.affirmationText}>
              “{nextMilestone.affirmation}”
            </Text>
          </View>
        )}
      </Card>
      </TouchableOpacity>

      <View style={{ height: spacing.lg }} />

      {/* REQUIREMENT: Calendar Preview */}
      <SectionHeader
        kicker="MOMENTUM MAP"
        title="Calendar History"
      />

      <TrackerCalendarPreview
        habit={habit}
        checkIns={checkIns}
        onOpenCheckInForDate={(dateStr) => {
          // If today, offer quick check-in
          const todayStr = getLocalDateString(currentTime);
          if (dateStr === todayStr) {
            setCheckInSheetVisible(true);
          }
        }}
      />

      <View style={{ height: spacing.lg }} />

      {/* REQUIREMENT: My Why */}
      <SectionHeader
        kicker="SOVEREIGN PURPOSE"
        title="My Why"
      />

      <Card variant="default" padding="lg">
        <View style={styles.quoteCardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={15} color={habit.accentColor || colors.accent.primary} />
            <Text variant="subcaption" color="accent" weight="500">
              CORE AFFIRMATION
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            style={styles.editBtn}
            activeOpacity={0.7}
          >
            <Edit3 size={13} color={colors.accent.primary} />
            <Text variant="caption" color="accent" weight="500">
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        <Text variant="bodyMedium" color="primary" weight="500" style={styles.pledgeQuote}>
          “{habit.pledge || 'To wake up clear, protect my peace, and be present for life.'}”
        </Text>
      </Card>

      <View style={{ height: spacing.base }} />

      {/* REQUIREMENT: Goals / Improvements */}
      <Card variant="default" padding="lg">
        <View style={styles.quoteCardHeader}>
          <Text variant="subcaption" color="tertiary" weight="500">
            GOALS &amp; IMPROVEMENTS
          </Text>
          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            style={styles.editBtn}
            activeOpacity={0.7}
          >
            <Edit3 size={13} color={colors.accent.primary} />
            <Text variant="caption" color="accent" weight="500">
              Customize
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.improvementsList}>
          {improvementsList.map((item, idx) => (
            <View key={idx} style={styles.improvementRow}>
              <View style={styles.improvementDot} />
              <Text variant="caption" color="primary" weight="500">
                {item}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ height: spacing.base }} />

      {/* REQUIREMENT: Mindset */}
      <Card variant="default" padding="lg">
        <View style={styles.quoteCardHeader}>
          <Text variant="subcaption" color="tertiary" weight="500">
            CURRENT MINDSET
          </Text>
          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            style={styles.editBtn}
            activeOpacity={0.7}
          >
            <Edit3 size={13} color={colors.accent.primary} />
            <Text variant="caption" color="accent" weight="500">
              Update
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mindsetBox}>
          <StatusChip
            label={habit.mindset || 'Determined & Ready'}
            tone="primary"
            icon={<Smile size={13} color={colors.accent.primary} />}
          />
          <Text variant="caption" color="secondary" style={{ marginTop: 6, lineHeight: 18 }}>
            Grounded in calm presence. You are treating recovery not as a punishment, but as a deliberate choice for peace.
          </Text>
        </View>
      </Card>

      <View style={{ height: spacing.base }} />

      {/* REQUIREMENT: Notes */}
      <Card variant="default" padding="lg">
        <View style={styles.quoteCardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <FileText size={15} color={colors.text.secondary} />
            <Text variant="subcaption" color="tertiary" weight="500">
              JOURNAL NOTES &amp; REFLECTIONS
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setEditingNoteText(habit.notes || '');
              setNoteModalVisible(true);
            }}
            style={styles.editBtn}
            activeOpacity={0.7}
          >
            <Edit3 size={13} color={colors.accent.primary} />
            <Text variant="caption" color="accent" weight="500">
              {habit.notes ? 'Edit' : '+ Add Note'}
            </Text>
          </TouchableOpacity>
        </View>

        {habit.notes ? (
          <Text variant="body" color="primary" style={styles.noteContent}>
            {habit.notes}
          </Text>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setEditingNoteText('');
              setNoteModalVisible(true);
            }}
            style={styles.emptyNoteArea}
            activeOpacity={0.7}
          >
            <Plus size={16} color={colors.accent.primary} />
            <Text variant="caption" color="secondary">
              Record personal coping triggers, victories, or words of encouragement...
            </Text>
          </TouchableOpacity>
        )}
      </Card>

      <View style={{ height: spacing.xl }} />

      {/* REQUIREMENT: Actions (Check-in, Share, Reset) */}
      <View style={styles.actionButtonsRow}>
        <View style={{ flex: 2 }}>
          <Button
            label="Daily Check-in"
            variant="primary"
            size="lg"
            iconLeft={<ShieldCheck size={18} color={colors.text.inverse} />}
            onPress={() => setCheckInSheetVisible(true)}
            fullWidth
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Reset Tracker"
            variant="outline"
            size="lg"
            iconLeft={<RotateCcw size={16} color={colors.text.secondary} />}
            onPress={() => setResetModalVisible(true)}
            fullWidth
          />
        </View>
      </View>

      <View style={{ height: 120 }} />

      {/* Daily Check-in BottomSheet (unified consistent check-in) */}
      <CheckInModalSheet
        visible={checkInSheetVisible}
        onClose={() => setCheckInSheetVisible(false)}
        habit={habit}
        dateStr={todayStr}
        existingCheckIn={todayCheckIn}
        onSave={handleSaveCheckInFromSheet}
      />

      {/* Mindful Restart Modal */}
      <Modal
        visible={resetModalVisible}
        onClose={() => setResetModalVisible(false)}
        title="Mindful Restart"
        description="Recovery is a continuous journey of self-compassion, not a fragile scorecard. Resetting records your honest courage and begins a fresh dawn."
        icon={
          <View style={styles.modalResetIcon}>
            <RotateCcw size={26} color={colors.accent.rose} />
          </View>
        }
        actions={
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => setResetModalVisible(false)}
                fullWidth
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Reset Clock"
                variant="danger"
                onPress={handleConfirmReset}
                fullWidth
              />
            </View>
          </View>
        }
      >
        <View style={{ marginTop: spacing.sm }}>
          <Input
            label="Optional Reflection on this Setback"
            value={resetReason}
            onChangeText={setResetReason}
            placeholder="What triggered this? What will you do differently?"
            multiline
            numberOfLines={2}
          />
        </View>
      </Modal>

      {/* Edit Notes Modal */}
      <Modal
        visible={noteModalVisible}
        onClose={() => setNoteModalVisible(false)}
        title="Personal Journal Note"
        description="Jot down personal reminders, coping strategies, or victories on this path."
        actions={
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => setNoteModalVisible(false)}
                fullWidth
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Save Note"
                variant="primary"
                onPress={handleSaveNote}
                fullWidth
              />
            </View>
          </View>
        }
      >
        <Input
          label="Your Notes & Strategy"
          value={editingNoteText}
          onChangeText={setEditingNoteText}
          multiline
          numberOfLines={4}
          inputStyle={{ height: 110, alignItems: 'flex-start', paddingTop: 8 }}
          placeholder="e.g. When feeling stressed after 6 PM, take a 15-minute walk outside instead of turning to old habits..."
        />
      </Modal>

      {/* Edit Tracker Modal */}
      <EditTrackerModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        habit={habit}
        onSave={handleSaveHabitUpdates}
        onDelete={handleDeleteHabit}
      />

      {/* Share Streak Modal */}
      <ShareStreakModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        habit={habit}
        cleanTime={cleanTime}
        longestStreak={longestStreak}
        moneySaved={moneySaved}
        hoursSaved={hoursSaved}
      />
    </ScreenContainer>
  );
}

const baseStyles = StyleSheet.create({
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  habitOverviewCard: {
    backgroundColor: colors.background.surface,
  },
  habitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statGridCol: {
    width: '48.5%',
  },
  milestoneCard: {
    backgroundColor: colors.background.surface,
  },
  milestoneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.md,
  },
  milestoneIconCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.accent.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(26, 24, 22, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  milestoneAffirmationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  affirmationText: {
    fontStyle: 'italic',
    flex: 1,
  },
  quoteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  pledgeQuote: {
    fontStyle: 'italic',
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  improvementsList: {
    gap: 8,
    marginTop: spacing.xs,
  },
  improvementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  improvementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.primary,
  },
  mindsetBox: {
    marginTop: spacing.xs,
  },
  noteContent: {
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  emptyNoteArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.subtle,
    borderRadius: radii.md,
    marginTop: spacing.xs,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalResetIcon: {
    width: 54,
    height: 54,
    borderRadius: radii.full,
    backgroundColor: colors.accent.roseLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInSuccess: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  checkInSuccessIcon: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: colors.accent.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetList: {
    paddingVertical: spacing.xs,
  },
  choiceCard: {
    backgroundColor: colors.background.subtle,
    borderRadius: radii.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  choiceInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  choiceIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
