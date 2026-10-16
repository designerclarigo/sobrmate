import { useTheme, useThemedStyles } from '../../design-system/theme';
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Check,
  DollarSign,
  Clock,
  Sparkles,
  Heart,
  ShieldCheck,
  Zap,
  Trash2,
  Calendar,
  AlertTriangle,
} from 'lucide-react-native';
import {
  Text,
  Modal,
  Card,
  Input,
  Toggle,
  Button,
  colors,
  spacing,
  radii,
  shadows,
} from '../../design-system';
import { Habit } from '../../data/types';
import { RecoveryQuestionnaire } from '../habit-selection/RecoveryQuestionnaire';
import { emptyPersonalization,hasPersonalization } from '../../data/personalization';
import { triggerHaptic } from '../../utils/haptics';

interface EditTrackerModalProps {
  visible: boolean;
  onClose: () => void;
  habit: Habit;
  onSave: (updates: Partial<Habit>) => Promise<void>;
  onDelete?: (habitId: string) => Promise<void>;
}

const ALL_IMPROVEMENTS = [
  'Mental Clarity',
  'Sleep Quality',
  'Physical Energy',
  'Emotional Peace',
  'Self-Respect',
  'Relationships & Family',
  'Career Focus',
  'Financial Savings',
];

const ALL_MINDSETS = [
  'Determined & Ready',
  'Cautiously Hopeful',
  'One Day at a Time',
  'Overwhelmed but Seeking Change',
];

const ALL_GOALS = [
  'One Day at a Time',
  '30-Day New Moon Renewal',
  '90-Day Season of Rebirth',
  'One Year Bloom',
  'Lifelong Commitment',
];

export const EditTrackerModal: React.FC<EditTrackerModalProps> = ({
  visible,
  onClose,
  habit,
  onSave,
  onDelete,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const [title, setTitle] = useState(habit.title);
  const [pledge, setPledge] = useState(habit.pledge || '');
  const [improvements, setImprovements] = useState<string[]>(habit.improvements || []);
  const [mindset, setMindset] = useState(habit.mindset || 'Determined & Ready');
  const [goal, setGoal] = useState(habit.goal || 'One Day at a Time');
  const [personalization,setPersonalization]=useState(habit.personalization??emptyPersonalization());
  const [showPersonalization,setShowPersonalization]=useState(false);
  const [notes, setNotes] = useState(habit.notes || '');

  // Financial tracking
  const [financialEnabled, setFinancialEnabled] = useState(habit.financialTracking.enabled);
  const [costPerDay, setCostPerDay] = useState(habit.financialTracking.costPerDay.toString());

  // Time tracking
  const [timeEnabled, setTimeEnabled] = useState(habit.timeTracking.enabled);
  const [hoursPerDay, setHoursPerDay] = useState(habit.timeTracking.hoursPerDaySaved.toString());

  // Date adjust
  const [adjustDateMode, setAdjustDateMode] = useState(false);
  const [customDaysAgo, setCustomDaysAgo] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync state when habit changes
  useEffect(() => {
    setTitle(habit.title);
    setPledge(habit.pledge || '');
    setImprovements(habit.improvements || []);
    setMindset(habit.mindset || 'Determined & Ready');
    setGoal(habit.goal || 'One Day at a Time');
    setNotes(habit.notes || '');
    setPersonalization(habit.personalization??emptyPersonalization());setShowPersonalization(false);
    setFinancialEnabled(habit.financialTracking.enabled);
    setCostPerDay(habit.financialTracking.costPerDay.toString());
    setTimeEnabled(habit.timeTracking.enabled);
    setHoursPerDay(habit.timeTracking.hoursPerDaySaved.toString());
    setConfirmDelete(false);
    setAdjustDateMode(false);
  }, [habit, visible]);

  const toggleImprovement = (item: string) => {
    triggerHaptic('selection');
    if (improvements.includes(item)) {
      setImprovements(improvements.filter((i) => i !== item));
    } else {
      setImprovements([...improvements, item]);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || isSubmitting) return;
    setError('');
    if(financialEnabled&&(!costPerDay.trim()||!Number.isFinite(Number(costPerDay))||Number(costPerDay)<0||Number(costPerDay)>1000000)){setError('Enter a daily cost between 0 and 1,000,000.');return;}
    if(timeEnabled&&(!hoursPerDay.trim()||!Number.isFinite(Number(hoursPerDay))||Number(hoursPerDay)<0||Number(hoursPerDay)>24)){setError('Enter hours saved between 0 and 24.');return;}
    if(adjustDateMode&&(!/^\d+$/.test(customDaysAgo)||Number(customDaysAgo)>36500)){setError('Enter completed days between 0 and 36,500.');return;}

    setIsSubmitting(true);
    triggerHaptic('medium');

    const updates: Partial<Habit> = {
      title: title.trim(),
      pledge: pledge.trim(),
      improvements,
      mindset,
      goal,
      notes: notes.trim(),
      personalization:hasPersonalization(personalization)?personalization:undefined,
      financialTracking: {
        enabled: financialEnabled,
        costPerDay: financialEnabled ? Number(costPerDay) : 0,
        currency: habit.financialTracking.currency || '$',
      },
      timeTracking: {
        enabled: timeEnabled,
        hoursPerDaySaved: timeEnabled ? Number(hoursPerDay) : 0,
      },
    };

    // If custom days ago specified
    if (adjustDateMode && customDaysAgo.trim()) {
      const days = parseInt(customDaysAgo, 10);
      if (!isNaN(days) && days >= 0) {
        const d = new Date();
        d.setDate(d.getDate() - days);
        updates.quitDate = d.toISOString();
      }
    }

    try { await onSave(updates); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save your changes.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (onDelete) {
      triggerHaptic('medium');
      try { await onDelete(habit.id); onClose(); }
      catch (e) { setError(e instanceof Error ? e.message : 'Unable to delete this tracker.'); }
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Edit Tracker Details"
      description={error || 'Update goals, financial calculations, mindset, and personal affirmations.'}
    >
      <ScrollView
        style={styles.modalScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Habit Name */}
        <Input
          label="Habit Name"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Alcohol-Free, Nicotine, Doomscrolling"
        />

        <View style={{ height: spacing.base }} />

        {/* Start / Quit Date adjustment */}
        <Card variant="subtle" padding="base">
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Calendar size={15} color={colors.accent.primary} />
              <Text variant="bodyMedium" color="primary" weight="500">
                Start Date of Clean Time
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setAdjustDateMode(!adjustDateMode)}
              style={styles.adjustToggle}
            >
              <Text variant="caption" color="accent" weight="500">
                {adjustDateMode ? 'Cancel' : 'Adjust Date'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
            Currently started: {new Date(habit.quitDate).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>

          {adjustDateMode && (
            <View style={{ marginTop: spacing.sm }}>
              <Input
                label="Days Clean So Far (Specify Days Ago)"
                value={customDaysAgo}
                onChangeText={setCustomDaysAgo}
                keyboardType="numeric"
                placeholder="e.g. 42"
                helperText="Recalculates your start timestamp back from today"
              />
            </View>
          )}
        </Card>

        <View style={{ height: spacing.base }} />

        {/* My Why / Pledge */}
        <Input
          label="My Why (Core Affirmation)"
          value={pledge}
          onChangeText={setPledge}
          multiline
          numberOfLines={3}
          inputStyle={{ height: 80, alignItems: 'flex-start', paddingTop: 8 }}
          placeholder="Why does leaving this habit behind matter to you?"
        />

        <View style={{ height: spacing.base }} />

        {/* Goals / Improvements */}
        <View>
          <Text variant="caption" color="tertiary" weight="500" style={styles.fieldKicker}>
            AREAS OF IMPROVEMENT
          </Text>
          <View style={styles.improvementsGrid}>
            {[...new Set([...ALL_IMPROVEMENTS, ...improvements])].map((item) => {
              const active = improvements.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggleImprovement(item)}
                  style={[styles.improvementChip, active && styles.improvementChipActive]}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle ${item}`}
                  accessibilityState={{ selected: active }}
                  aria-pressed={active}
                >
                  <Text
                    variant="caption"
                    color={active ? 'accent' : 'secondary'}
                    weight={active ? '500' : '400'}
                  >
                    {item}
                  </Text>
                  {active && <Check size={12} color={colors.accent.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: spacing.base }} />

        {/* Mindset */}
        <View>
          <Text variant="caption" color="tertiary" weight="500" style={styles.fieldKicker}>
            CURRENT MINDSET
          </Text>
          <View style={styles.mindsetList}>
            {[...new Set([...ALL_MINDSETS, mindset])].map((m) => {
              const isSelected = mindset === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => {
                    triggerHaptic('selection');
                    setMindset(m);
                  }}
                  style={[styles.choiceItem, isSelected && styles.choiceItemActive]}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityLabel={`Mindset: ${m}`}
                  accessibilityState={{ checked: isSelected }}
                  aria-checked={isSelected}
                >
                  <View style={styles.radioDot}>
                    {isSelected && <View style={styles.radioDotInner} />}
                  </View>
                  <Text
                    variant="caption"
                    color={isSelected ? 'accent' : 'primary'}
                    weight={isSelected ? '500' : '400'}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: spacing.base }} />

        {/* Milestone Goal Horizon */}
        <View>
          <Text variant="caption" color="tertiary" weight="500" style={styles.fieldKicker}>
            MILESTONE HORIZON GOAL
          </Text>
          <View style={styles.mindsetList}>
            {[...new Set([...ALL_GOALS, goal])].map((g) => {
              const isSelected = goal === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => {
                    triggerHaptic('selection');
                    setGoal(g);
                  }}
                  style={[styles.choiceItem, isSelected && styles.choiceItemActive]}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityLabel={`Goal: ${g}`}
                  accessibilityState={{ checked: isSelected }}
                  aria-checked={isSelected}
                >
                  <View style={styles.radioDot}>
                    {isSelected && <View style={styles.radioDotInner} />}
                  </View>
                  <Text
                    variant="caption"
                    color={isSelected ? 'accent' : 'primary'}
                    weight={isSelected ? '500' : '400'}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: spacing.base }} />

        <Button label={showPersonalization?'Hide recovery preferences':'Your recovery preferences'} variant="outline" disabled={isSubmitting} onPress={()=>setShowPersonalization(!showPersonalization)}/>
        {showPersonalization&&<View style={{marginVertical:20}}><RecoveryQuestionnaire value={personalization} onChange={setPersonalization} disabled={isSubmitting} stepLabel="YOUR RECOVERY PROFILE"/></View>}
        {/* Financial Tracking */}
        <Card variant="default" padding="base">
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" color="primary" weight="500">
                Financial Savings Tracking
              </Text>
              <Text variant="caption" color="secondary">
                Calculate total dollars saved over clean time
              </Text>
            </View>
            <Toggle value={financialEnabled} onValueChange={setFinancialEnabled} />
          </View>

          {financialEnabled && (
            <View style={{ marginTop: spacing.sm }}>
              <Input
                label="Average Daily Cost ($)"
                value={costPerDay}
                onChangeText={setCostPerDay}
                keyboardType="decimal-pad"
                placeholder="15.00"
                iconLeft={<DollarSign size={15} color={colors.accent.primary} />}
              />
            </View>
          )}
        </Card>

        <View style={{ height: spacing.base }} />

        {/* Time Tracking */}
        <Card variant="default" padding="base">
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" color="primary" weight="500">
                Time Reclaimed Tracking
              </Text>
              <Text variant="caption" color="secondary">
                Calculate waking hours returned
              </Text>
            </View>
            <Toggle value={timeEnabled} onValueChange={setTimeEnabled} />
          </View>

          {timeEnabled && (
            <View style={{ marginTop: spacing.sm }}>
              <Input
                label="Average Hours Spent Per Day"
                value={hoursPerDay}
                onChangeText={setHoursPerDay}
                keyboardType="decimal-pad"
                placeholder="2.0"
                iconLeft={<Clock size={15} color={colors.accent.sky} />}
              />
            </View>
          )}
        </Card>

        <View style={{ height: spacing.base }} />

        {/* Notes */}
        <Input
          label="Personal Notes & Reflections"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          inputStyle={{ height: 96, alignItems: 'flex-start', paddingTop: 8 }}
          placeholder="Personal coping strategies, triggers to avoid, gratitude notes..."
        />

        <View style={{ height: spacing.lg }} />

        {/* Danger Zone: Delete Habit */}
        {onDelete && (
          <Card variant="subtle" padding="base" style={styles.dangerCard}>
            <View style={styles.dangerRow}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium" color="rose" weight="500">
                  Delete Tracker
                </Text>
                <Text variant="caption" color="secondary">
                  Permanently remove this tracker and its records.
                </Text>
              </View>
              {confirmDelete ? (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    label="Cancel"
                    variant="ghost"
                    size="sm"
                    onPress={() => setConfirmDelete(false)}
                  />
                  <Button
                    label="Confirm"
                    variant="danger"
                    size="sm"
                    onPress={handleDelete}
                  />
                </View>
              ) : (
                <Button
                  label="Delete"
                  variant="outline"
                  size="sm"
                  iconLeft={<Trash2 size={13} color={colors.accent.rose} />}
                  onPress={() => setConfirmDelete(true)}
                />
              )}
            </View>
          </Card>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Save Action Buttons */}
      <View style={styles.modalFooter}>
        <View style={{ flex: 1 }}>
          <Button
            label="Cancel"
            variant="secondary"
            onPress={onClose}
            fullWidth
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Save Changes"
            variant="primary"
            loading={isSubmitting}
            onPress={handleSave}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
};

const baseStyles = StyleSheet.create({
  modalScroll: {
    maxHeight: 460,
  },
  scrollContent: {
    paddingVertical: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adjustToggle: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  fieldKicker: {
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  improvementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  improvementChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    backgroundColor: colors.background.subtle,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  improvementChipActive: {
    backgroundColor: colors.accent.primaryLight,
    borderColor: colors.accent.primary,
  },
  mindsetList: {
    gap: 6,
  },
  choiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.background.subtle,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  choiceItemActive: {
    backgroundColor: colors.accent.primaryLight,
    borderColor: colors.accent.primary,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.primary,
  },
  dangerCard: {
    backgroundColor: colors.accent.roseLight,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
});
