import { NativeTextInput as TextInput } from '../../design-system/components/NativeInput';
import { useTheme, useThemedStyles } from '../../design-system/theme';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform, Keyboard } from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  Clock,
  Sparkles,
  DollarSign,
  Heart,
  ShieldCheck,
  Zap,
  Smile,
  Compass,
  Award,
  CheckCircle2,
} from 'lucide-react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  Input,
  Toggle,
  colors,
  spacing,
  radii,
  shadows,
} from '../../design-system';
import { CatalogHabit } from '../../data/habitCatalog';
import { useRecoveryStore } from '../../data/store';
import { usePremium } from '../../data/premium';
import { triggerHaptic } from '../../utils/haptics';
import { normalizeHabitCategory } from '../../data/habitCategories';
import { emptyPersonalization,hasPersonalization } from '../../data/personalization';
import { RecoveryQuestionnaire } from './RecoveryQuestionnaire';
import { useReducedMotion } from '../../utils/useReducedMotion';

import {TrackerSetupForm} from '../../data/setupDraft';

interface TrackerSetupWizardProps {
  initialForm?:TrackerSetupForm;draftId?:string;externalBusy?:boolean;cancelLabel?:string;
  onDraftChange?:(form:TrackerSetupForm)=>void;onPersist?:(form:TrackerSetupForm)=>Promise<void>;
  initialHabit: Partial<CatalogHabit>;
  onBack: () => void;
  onCancel?: () => void;
  onComplete: () => void;
}

export const TrackerSetupWizard: React.FC<TrackerSetupWizardProps> = ({
  initialHabit,initialForm,draftId,onDraftChange,onPersist,externalBusy=false,cancelLabel='Save & close',
  onBack,
  onCancel,
  onComplete,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const { addHabit,habits } = useRecoveryStore();
  const premium=usePremium();
  const reducedMotion = useReducedMotion();

  const totalSteps = 9;
  const [personalization,setPersonalization]=useState(()=>initialForm?.personalization??emptyPersonalization());
  const [currentStep, setCurrentStep] = useState<number>(initialForm?.currentStep??1);

  // Form State
  const [habitTitle, setHabitTitle] = useState<string>(initialForm?.habitTitle??initialHabit.title??'');
  const [quitTiming, setQuitTiming] = useState<'now' | 'today_morning' | 'yesterday' | '3days' | 'custom'>(initialForm?.quitTiming??'now');
  const [customDaysAgo, setCustomDaysAgo] = useState<string>(initialForm?.customDaysAgo??'0');
  const [personalWhy, setPersonalWhy] = useState<string>(
    initialForm?.personalWhy??(initialHabit.suggestedPledge || 'To wake up clear, protect my peace, and be present for life.')
  );
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>(initialForm?.selectedImprovements??['Mental Clarity','Sleep Quality']);
  const [currentMindset, setCurrentMindset] = useState<string>(initialForm?.currentMindset??'Determined & Ready');
  const [personalGoal, setPersonalGoal] = useState<string>(initialForm?.personalGoal??'One Day at a Time');

  // For custom habits: start disabled/blank without inventing default numbers
  const isCustomHabit = initialHabit.category === 'custom' || initialHabit.id?.startsWith('custom');
  const [customMetric,setCustomMetric]=useState<'status'|'count'|'minutes'>(initialForm?.customMetric??'status');
  const [customUnit,setCustomUnit]=useState(initialForm?.customUnit??'uses');
  const [financialEnabled,setFinancialEnabled]=useState(initialForm?.financialEnabled??(!isCustomHabit&&(initialHabit.defaultCostPerDay??0)>0));
  const [costPerDay,setCostPerDay]=useState(initialForm?.costPerDay??(isCustomHabit?'':String(initialHabit.defaultCostPerDay||15)));
  const [timeEnabled,setTimeEnabled]=useState(initialForm?.timeEnabled??!isCustomHabit);
  const [hoursPerDay,setHoursPerDay]=useState(initialForm?.hoursPerDay??(isCustomHabit?'':String(initialHabit.defaultHoursPerDay||2)));
  const [questionnaireStep,setQuestionnaireStep]=useState(initialForm?.questionnaireStep??0);
  const [savingDraft,setSavingDraft]=useState(false),draftSaving=useRef(false);
  const form=useMemo<TrackerSetupForm>(()=>({currentStep,habitTitle,quitTiming,customDaysAgo,personalWhy,selectedImprovements,currentMindset,personalGoal,customMetric,customUnit,financialEnabled,costPerDay,timeEnabled,hoursPerDay,personalization,questionnaireStep}),[currentStep,habitTitle,quitTiming,customDaysAgo,personalWhy,selectedImprovements,currentMindset,personalGoal,customMetric,customUnit,financialEnabled,costPerDay,timeEnabled,hoursPerDay,personalization,questionnaireStep]);
  useEffect(()=>{onDraftChange?.(form);},[form,onDraftChange]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [moving, setMoving] = useState(false);
  const submissionInFlight = useRef(false);
  const transitionInFlight = useRef(false);
  const mounted = useRef(true);
  const stepScroll = useRef<ScrollView>(null);
  const [error, setError] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value((initialForm?.currentStep??1) / totalSteps)).current;
  useEffect(() => { stepScroll.current?.scrollTo({ y: 0, animated: false }); }, [currentStep]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; fadeAnim.stopAnimation(); progressAnim.stopAnimation(); };
  }, [fadeAnim, progressAnim]);

  const animateToStep = (targetStep: number) => {
    if (transitionInFlight.current || submissionInFlight.current) return;
    Keyboard.dismiss();
    triggerHaptic('light');
    if (reducedMotion) {
      setCurrentStep(targetStep);
      progressAnim.setValue(targetStep / totalSteps);
      return;
    }
    transitionInFlight.current = true;
    setMoving(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: Platform.OS !== 'web',
    }).start(({ finished }) => {
      if (!mounted.current) return;
      if (!finished) { transitionInFlight.current = false; setMoving(false); return; }
      setCurrentStep(targetStep);
      Animated.timing(progressAnim, {
        toValue: targetStep / totalSteps,
        duration: 250,
        useNativeDriver: true,
      }).start();

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => { if (mounted.current) { transitionInFlight.current = false; setMoving(false); } });
    });
  };

  const persistStep=async(step:number)=>{
    if(!onPersist)return true;
    if(draftSaving.current)return false;
    draftSaving.current=true;setSavingDraft(true);
    try{await onPersist({...form,currentStep:step});return true;}
    catch(error){setError(error instanceof Error?error.message:'Could not save your setup. Please retry.');return false;}
    finally{draftSaving.current=false;if(mounted.current)setSavingDraft(false);}
  };
  const handleNext = async () => {
    if (isSubmitting || submissionInFlight.current || transitionInFlight.current || draftSaving.current || externalBusy) return;
    setError('');
    // Validation
    if (currentStep === 1 && !habitTitle.trim()) {
      return;
    }
    if (currentStep === 3 && !personalWhy.trim()) {
      return;
    }
    if (quitTiming === 'custom' && (!/^\d+$/.test(customDaysAgo) || Number(customDaysAgo) > 36500)) { setError('Enter completed days between 0 and 36,500.'); return; }
    if (currentStep >= 8 && financialEnabled && (!Number.isFinite(Number(costPerDay)) || Number(costPerDay) < 0 || Number(costPerDay) > 1000000 || !costPerDay.trim())) { setError('Enter a daily cost between 0 and 1,000,000.'); return; }
    if (currentStep >= 8 && timeEnabled && (!Number.isFinite(Number(hoursPerDay)) || Number(hoursPerDay) < 0 || Number(hoursPerDay) > 24 || !hoursPerDay.trim())) { setError('Enter hours between 0 and 24.'); return; }

    if (currentStep < totalSteps) {
      if(await persistStep(currentStep+1))animateToStep(currentStep + 1);
    } else {
      if(habits.length>=3&&!premium.canAccess('unlimited_trackers')){premium.openPaywall('unlimited_trackers');return;}
      // Final submission
      submissionInFlight.current = true;
      setIsSubmitting(true);
      triggerHaptic('medium');

      // Calculate quit date ISO
      const quitDate = new Date();
      if (quitTiming === 'today_morning') {
        quitDate.setHours(0, 0, 0, 0);
      } else if (quitTiming === 'yesterday') {
        quitDate.setDate(quitDate.getDate() - 1);
      } else if (quitTiming === '3days') {
        quitDate.setDate(quitDate.getDate() - 3);
      } else if (quitTiming === 'custom') {
        const parsed = parseInt(customDaysAgo, 10) || 0;
        quitDate.setDate(quitDate.getDate() - parsed);
      }

      try {
      await onPersist?.(form);
      await addHabit({
        title: habitTitle.trim(),
        category: normalizeHabitCategory(initialHabit.category ?? 'custom') ?? 'custom',
        trackingMetric: isCustomHabit?customMetric:initialHabit.category === 'alcohol' ? 'drinks' : initialHabit.category==='nicotine'?'count': /social media|gaming|screen|scroll|smartphone|internet/i.test(initialHabit.title||habitTitle)?'minutes':'status',
          ...(isCustomHabit&&customMetric==='count'?{trackingUnit:customUnit.trim()||'uses'}:initialHabit.category==='nicotine'?{trackingUnit:/cigarette|smoking|tobacco/i.test(initialHabit.title||habitTitle)?'cigarettes':'puffs'}:{}),
        quitDate: quitDate.toISOString(),
        accentColor: initialHabit.accentColor || colors.accent.primary,
        iconName: initialHabit.iconName || 'ShieldCheck',
        pledge: personalWhy.trim(),
        financialTracking: {
          enabled: financialEnabled,
          costPerDay: financialEnabled ? Number(costPerDay) : 0,
          currency: '$',
        },
        timeTracking: {
          enabled: timeEnabled,
          hoursPerDaySaved: timeEnabled ? Number(hoursPerDay) : 0,
        },
        improvements: selectedImprovements,
        mindset: currentMindset,
        goal: personalGoal,
        notes: '',
        ...(hasPersonalization(personalization)?{personalization}:{}),
      },draftId);

      onComplete();
      } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create your tracker. Please try again.'); submissionInFlight.current = false; setIsSubmitting(false); }
    }
  };

  const handleBack = async() => {
    if (submissionInFlight.current || transitionInFlight.current || draftSaving.current || externalBusy) return;
    if (currentStep > 1) {
      if(await persistStep(currentStep-1))animateToStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleCancel = () => {
    if (submissionInFlight.current || transitionInFlight.current || draftSaving.current || externalBusy) return;
    triggerHaptic('light');
    if (onCancel) {
      onCancel();
    } else {
      onBack();
    }
  };

  const toggleImprovement = (item: string) => {
    triggerHaptic('selection');
    if (selectedImprovements.includes(item)) {
      setSelectedImprovements(selectedImprovements.filter((i) => i !== item));
    } else {
      setSelectedImprovements([...selectedImprovements, item]);
    }
  };

  const getQuitTimingLabel = () => {
    switch (quitTiming) {
      case 'yesterday':
        return 'Yesterday (1 day completed)';
      case '3days':
        return '3 days ago (3 days completed)';
      case 'custom':
        return `${customDaysAgo || 0} days clean so far`;
      case 'now':
      default:
        return 'Starting right now';
    }
  };

  return (
    <View style={styles.container} pointerEvents={savingDraft||externalBusy?'none':'auto'}>
      {!!error && <Text accessibilityRole="alert" color="rose" align="center" style={{ padding: 12 }}>{error}</Text>}
      {/* Top Navigation Bar with Step indicator & 44px Cancel Button on EVERY step */}
      <View style={styles.topBar}>
        <IconButton
          icon={<ArrowLeft size={18} color={colors.text.primary} />}
          onPress={handleBack}
          size={38}
          variant="filled"
          accessibilityLabel="Back to previous step"
          disabled={isSubmitting || moving || savingDraft || externalBusy}
        />

        <View style={styles.stepBadge}>
          <Text variant="subcaption" color="secondary" weight="500">
            STEP {currentStep} OF {totalSteps}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleCancel}
          style={styles.cancelBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          disabled={isSubmitting || moving || savingDraft || externalBusy}
          accessibilityState={{ disabled: isSubmitting || moving || savingDraft || externalBusy }}
        >
          <Text variant="caption" color="secondary" weight="500">
            {cancelLabel}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Line */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              transform: [{ scaleX: progressAnim }],
            },
          ]}
        />
      </View>

      {/* Scrollable Step Body */}
      <ScrollView
        ref={stepScroll}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* STEP 1: Habit Name Confirmation */}
          {currentStep === 1 && (
            <View>
              <Text variant="subcaption" color="accent" weight="500" style={styles.kicker}>
                STEP 1 • HABIT DEFINITION
              </Text>
              <Text variant="title1" color="primary" serif weight="400" style={styles.title}>
                Confirm your habit
              </Text>
              <Text variant="body" color="secondary" style={styles.description}>
                You can personalize the exact name of what you are choosing to leave behind.
              </Text>

              <View style={styles.formSection}>
                <Input
                  label="Habit Name"
                  value={habitTitle}
                  onChangeText={setHabitTitle}
                  placeholder="e.g. Alcohol-Free, Nicotine, Doomscrolling"
                  autoFocus
                />
                {isCustomHabit&&<View style={{gap:12,marginTop:24}}><Text weight="500">How would you like to track?</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{(['status','count','minutes'] as const).map(metric=><Button key={metric} label={metric==='status'?'Daily status':metric==='count'?'Quantity':'Minutes'} variant={customMetric===metric?'primary':'outline'} size="sm" onPress={()=>setCustomMetric(metric)}/>)}</View>{customMetric==='count'&&<Input label="Quantity unit" value={customUnit} onChangeText={setCustomUnit} maxLength={30} placeholder="e.g. cups, uses"/>}</View>}
              </View>

              <Card variant="subtle" padding="base" style={styles.tipCard}>
                <View style={styles.tipRow}>
                  <Sparkles size={16} color={colors.accent.primary} />
                  <Text variant="caption" color="secondary" style={{ flex: 1 }}>
                    Tip: Choosing an affirmative title (e.g. "Alcohol-Free" instead of "Stop Drinking") frames your commitment around positive personal growth.
                  </Text>
                </View>
              </Card>
            </View>
          )}

          {/* STEP 2: Quit Date and Time */}
          {currentStep === 2 && (
            <View>
              <Text variant="subcaption" color="accent" weight="500" style={styles.kicker}>
                STEP 2 • STARTING POINT
              </Text>
              <Text variant="title1" color="primary" serif weight="400" style={styles.title}>
                When does your clean time begin?
              </Text>
              <Text variant="body" color="secondary" style={styles.description}>
                Every journey has an exact point of origin. When was your last encounter?
              </Text>

              <View style={styles.optionsList}>
                {[
                  { key: 'now', title: 'Just Now / Starting Today', desc: 'Begin ticking clean time from right this second' },
                  { key: 'yesterday', title: 'Yesterday', desc: 'Already completed 1 full day of freedom' },
                  { key: '3days', title: '3 Days Ago', desc: 'Three full days of committed progress completed' },
                  { key: 'custom', title: 'I started earlier', desc: 'Specify how many days ago you began' },
                ].map((opt) => {
                  const isSelected = quitTiming === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      onPress={() => {
                        triggerHaptic('selection');
                        setQuitTiming(opt.key as any);
                      }}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={opt.title}
                      accessibilityState={{ selected: isSelected }}
                      style={[
                        styles.selectCard,
                        isSelected && styles.selectCardSelected,
                      ]}
                    >
                      <View style={styles.selectCardRadio}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyMedium" color={isSelected ? 'accent' : 'primary'} weight="500">
                          {opt.title}
                        </Text>
                        <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                          {opt.desc}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {quitTiming === 'custom' && (
                  <View style={{ marginTop: spacing.sm }}>
                    <Input
                      label="Days Clean So Far"
                      value={customDaysAgo}
                      onChangeText={setCustomDaysAgo}
                      keyboardType="numeric"
                      placeholder="e.g. 14"
                    />
                  </View>
                )}
              </View>
            </View>
          )}

          {/* STEP 3: Core Purpose / Personal Affirmation */}
          {currentStep === 3 && (
            <View>
              <Text variant="subcaption" color="accent" weight="500" style={styles.kicker}>
                STEP 3 • CORE PURPOSE
              </Text>
              <Text variant="title1" color="primary" serif weight="400" style={styles.title}>
                Why are you doing this?
              </Text>
              <Text variant="body" color="secondary" style={styles.description}>
                This affirmation will be displayed on your main tracker to anchor you during moments of temptation.
              </Text>

              <View style={styles.formSection}>
                <Input
                  label="Your Personal Affirmation"
                  value={personalWhy}
                  onChangeText={setPersonalWhy}
                  multiline
                  numberOfLines={3}
                  inputStyle={{ height: 88, alignItems: 'flex-start', paddingTop: 10 }}
                  placeholder="In your own words, why does this matter to you?"
                />

                <Text variant="caption" color="secondary" weight="500" style={{ marginTop: spacing.md, marginBottom: spacing.xs }}>
                  QUICK INSPIRATIONS (TAP TO USE):
                </Text>
                <View style={styles.chipsWrap}>
                  {[
                    'To wake up clear and protect my peace.',
                    'For my physical health and longevity.',
                    'To be fully present for my family.',
                    'To live with self-respect and intention.',
                    'To regain deep focus and daily calm.',
                  ].map((phrase, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        triggerHaptic('light');
                        setPersonalWhy(phrase);
                      }}
                      style={styles.suggestionChip}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={phrase}
                    >
                      <Text variant="caption" color="secondary">
                        {phrase}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* STEP 4: Visions of Growth */}
          {currentStep === 4 && (
            <View>
              <Text variant="subcaption" color="accent" weight="500" style={styles.kicker}>
                STEP 4 • VISIONS OF GROWTH
              </Text>
              <Text variant="title1" color="primary" serif weight="400" style={styles.title}>
                What do you want to improve?
              </Text>
              <Text variant="body" color="secondary" style={styles.description}>
                Select all areas you are looking forward to nurturing as you build healthy daily habits.
              </Text>

              <View style={styles.gridWrap}>
                {[
                  { label: 'Mental Clarity', icon: <Sparkles size={16} color={colors.accent.primary} /> },
                  { label: 'Sleep Quality', icon: <Clock size={16} color={colors.accent.primary} /> },
                  { label: 'Physical Energy', icon: <Zap size={16} color={colors.accent.champagne} /> },
                  { label: 'Emotional Peace', icon: <Heart size={16} color={colors.accent.rose} /> },
                  { label: 'Self-Respect', icon: <ShieldCheck size={16} color={colors.accent.success} /> },
                  { label: 'Relationships & Family', icon: <Smile size={16} color={colors.accent.primary} /> },
                  { label: 'Career Focus', icon: <Compass size={16} color={colors.accent.champagne} /> },
                  { label: 'Financial Savings', icon: <DollarSign size={16} color={colors.accent.success} /> },
                ].map((item) => {
                  const isSelected = selectedImprovements.includes(item.label);
                  return (
                    <TouchableOpacity
                      key={item.label}
                      onPress={() => toggleImprovement(item.label)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      accessibilityState={{ selected: isSelected }}
                      style={[
                        styles.gridChip,
                        isSelected && styles.gridChipSelected,
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {item.icon}
                        <Text
                          variant="caption"
                          color={isSelected ? 'accent' : 'primary'}
                          weight={isSelected ? '500' : '400'}
                        >
                          {item.label}
                        </Text>
                      </View>
                      {isSelected && <Check size={14} color={colors.accent.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 5: Current Mindset */}
          {currentStep === 5 && (
            <View>
              <Text variant="subcaption" color="accent" weight="500" style={styles.kicker}>
                STEP 5 • INNER STATE
              </Text>
              <Text variant="title1" color="primary" serif weight="400" style={styles.title}>
                Where is your mindset right now?
              </Text>
              <Text variant="body" color="secondary" style={styles.description}>
                Honoring your present headspace helps set realistic, compassionate expectations.
              </Text>

              <View style={styles.optionsList}>
                {[
                  { key: 'Determined & Ready', desc: 'Fired up with deep resolve and clarity.' },
                  { key: 'Cautiously Hopeful', desc: 'Taking quiet, humble steps without overwhelming expectations.' },
                  { key: 'One Day at a Time', desc: 'Focusing exclusively on getting through today cleanly.' },
                  { key: 'Overwhelmed but Seeking Change', desc: 'Acknowledging the struggle and choosing to begin anyway.' },
                ].map((item) => {
                  const isSelected = currentMindset === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      onPress={() => {
                        triggerHaptic('selection');
                        setCurrentMindset(item.key);
                      }}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={item.key}
                      accessibilityState={{ selected: isSelected }}
                      style={[
                        styles.selectCard,
                        isSelected && styles.selectCardSelected,
                      ]}
                    >
                      <View style={styles.selectCardRadio}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyMedium" color={isSelected ? 'accent' : 'primary'} weight="500">
                          {item.key}
                        </Text>
                        <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                          {item.desc}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 6: Personal Goal */}
          {currentStep === 6 && (
            <View>
              <Text variant="subcaption" color="accent" weight="500" style={styles.kicker}>
                STEP 6 • HORIZON
              </Text>
              <Text variant="title1" color="primary" serif weight="400" style={styles.title}>
                What is your milestone goal?
              </Text>
              <Text variant="body" color="secondary" style={styles.description}>
                Setting an initial horizon gives your journey a tangible landmark to celebrate.
              </Text>

              <View style={styles.optionsList}>
                {[
                  { key: 'One Day at a Time', desc: 'No distant pressures. Just unbroken presence today.' },
                  { key: '30-Day New Moon Renewal', desc: 'A full month of steady, consistent practice.' },
                  { key: '90-Day Season of Rebirth', desc: 'A full quarter-year of transformative habit reformation.' },
                  { key: 'One Year Bloom', desc: 'Experience all 365 days and seasons completely clean.' },
                  { key: 'Lifelong Commitment', desc: 'A lasting lifestyle of freedom and self-mastery.' },
                ].map((item) => {
                  const isSelected = personalGoal === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      onPress={() => {
                        triggerHaptic('selection');
                        setPersonalGoal(item.key);
                      }}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={item.key}
                      accessibilityState={{ selected: isSelected }}
                      style={[
                        styles.selectCard,
                        isSelected && styles.selectCardSelected,
                      ]}
                    >
                      <View style={styles.selectCardRadio}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyMedium" color={isSelected ? 'accent' : 'primary'} weight="500">
                          {item.key}
                        </Text>
                        <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                          {item.desc}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {currentStep === 7 && <RecoveryQuestionnaire initialQuestion={questionnaireStep} onQuestionChange={setQuestionnaireStep} value={personalization} onChange={setPersonalization} disabled={moving||isSubmitting}/>}
          {/* STEP 8: Optional Daily Cost & Time Saved + 'Your Plan' Review Card */}
          {currentStep === 8 && (
            <View>
              <Text variant="subcaption" color="accent" weight="500" style={styles.kicker}>
                STEP 8 • DAILY ESTIMATES
              </Text>
              <Text variant="title1" color="primary" serif weight="400" style={styles.title}>
                Savings &amp; Time Estimates
              </Text>
              <Text variant="body" color="secondary" style={styles.description}>
                Optional: SobrMate automatically tracks your compounded dollars and hours returned.
              </Text>

              <View style={styles.formSection}>
                {/* Financial Tracking */}
                <Card variant="default" padding="base" style={styles.metricSetupCard}>
                  <View style={styles.metricHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium" color="primary" weight="500">
                        Daily Spending ($)
                      </Text>
                      <Text variant="caption" color="secondary">
                        How much did this habit cost per day?
                      </Text>
                    </View>
                    <Toggle value={financialEnabled} onValueChange={setFinancialEnabled} />
                  </View>

                  {financialEnabled && (
                    <View style={styles.metricInputBox}>
                      <Input
                        label="Average Cost Per Day"
                        value={costPerDay}
                        onChangeText={setCostPerDay}
                        keyboardType="decimal-pad"
                        placeholder="15"
                        iconLeft={<DollarSign size={16} color={colors.accent.primary} />}
                        helperText="Calculates real-time financial savings"
                      />
                    </View>
                  )}
                </Card>

                <View style={{ height: spacing.md }} />

                {/* Time Tracking */}
                <Card variant="default" padding="base" style={styles.metricSetupCard}>
                  <View style={styles.metricHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium" color="primary" weight="500">
                        Hours Spent Daily
                      </Text>
                      <Text variant="caption" color="secondary">
                        How many hours were lost to this cycle?
                      </Text>
                    </View>
                    <Toggle value={timeEnabled} onValueChange={setTimeEnabled} />
                  </View>

                  {timeEnabled && (
                    <View style={styles.metricInputBox}>
                      <Input
                        label="Hours Saved Per Day"
                        value={hoursPerDay}
                        onChangeText={setHoursPerDay}
                        keyboardType="decimal-pad"
                        placeholder="2.0"
                        iconLeft={<Clock size={16} color={colors.accent.primary} />}
                        helperText="Calculates daily hours returned to your routine"
                      />
                    </View>
                  )}
                </Card>

                <View style={{ height: spacing.lg }} />


              </View>
            </View>
          )}
          {currentStep === 9 && <View><Text variant="subcaption" color="secondary" style={styles.kicker}>YOUR FRESH START</Text><Text variant="display" serif style={{marginBottom:12}}>Ready for your next chapter.</Text><Text color="secondary" style={{marginBottom:24}}>Review your intention. You can edit these details whenever you need.</Text>                {/* CONCISE 'YOUR PLAN' REVIEW CARD */}
                <Card variant="default" padding="base" style={styles.planReviewCard}>
                  <View style={styles.planReviewHeader}>
                    <View style={styles.planReviewIcon}>
                      <CheckCircle2 size={18} color={colors.accent.primary} strokeWidth={2.2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="subcaption" color="accent" weight="500">
                        SUMMARY
                      </Text>
                      <Text variant="title3" color="primary" serif weight="400">
                        Your plan.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.planReviewBody}>
                    <View style={styles.planRow}>
                      <Text variant="caption" color="secondary" weight="500" style={styles.planLabel}>
                        Habit:
                      </Text>
                      <Text variant="bodyMedium" color="primary" weight="500" style={styles.planValue}>
                        {habitTitle}
                      </Text>
                    </View>

                    <View style={styles.planRow}>
                      <Text variant="caption" color="secondary" weight="500" style={styles.planLabel}>
                        Start:
                      </Text>
                      <Text variant="caption" color="primary" weight="500" style={styles.planValue}>
                        {getQuitTimingLabel()}
                      </Text>
                    </View>

                    <View style={styles.planRow}>
                      <Text variant="caption" color="secondary" weight="500" style={styles.planLabel}>
                        Intention:
                      </Text>
                      <Text variant="caption" color="primary" style={styles.planValue}>
                        “{personalWhy}”
                      </Text>
                    </View>

                    <View style={styles.planRow}>
                      <Text variant="caption" color="secondary" weight="500" style={styles.planLabel}>
                        Goal:
                      </Text>
                      <Text variant="caption" color="primary" weight="500" style={styles.planValue}>
                        {personalGoal} ({currentMindset})
                      </Text>
                    </View>

                    {hasPersonalization(personalization)&&<View style={styles.planRow}><Text variant="caption" color="secondary" style={styles.planLabel}>Your focus:</Text><Text variant="caption" style={styles.planValue}>{personalization.recoveryGoal||personalization.motivation||'Gentle daily support'}{personalization.triggers.length?` · Mindful of: ${personalization.triggers.join(', ')}`:''}</Text></View>}
                    <View style={styles.planRow}>
                      <Text variant="caption" color="secondary" weight="500" style={styles.planLabel}>
                        Estimates:
                      </Text>
                      <Text variant="caption" color="primary" weight="500" style={styles.planValue}>
                        {financialEnabled ? `${costPerDay || 0}/day saved` : 'No $ tracking'}
                        {' · '}
                        {timeEnabled ? `${hoursPerDay || 0}h/day reclaimed` : 'No time tracking'}
                      </Text>
                    </View>
                  </View>
                </Card></View>}
        </Animated.View>
      </ScrollView>

      {/* Sticky Bottom Action: 'Create tracker' on the final step, 'Continue' on previous steps */}
      <View style={styles.bottomBar}>
        <Button
          label={currentStep === totalSteps ? 'Create tracker' : 'Continue'}
          variant="primary"
          size="lg"
          loading={isSubmitting||savingDraft||externalBusy}
          disabled={savingDraft||externalBusy||moving || (currentStep === 1 && !habitTitle.trim()) || (currentStep === 3 && !personalWhy.trim())}
          iconRight={
            currentStep === totalSteps ? (
              <Award size={18} color={colors.text.inverse} />
            ) : (
              <ArrowRight size={18} color={colors.text.inverse} />
            )
          }
          onPress={handleNext}
          fullWidth
        />
      </View>
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.canvas,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    minHeight: 52,
  },
  stepBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: colors.background.subtle,
  },
  cancelBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border.subtle,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    transformOrigin: 'left center',
    backgroundColor: colors.accent.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 32,
  },
  kicker: {
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  title: {
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: spacing.xs,
  },
  description: {
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  formSection: {
    marginTop: spacing.xs,
  },
  tipCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(117, 97, 168, 0.2)',
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  optionsList: {
    gap: spacing.sm + 2,
  },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.background.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    ...shadows.subtle,
  },
  selectCardSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.primaryLight,
  },
  selectCardRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent.primary,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  suggestionChip: {
    backgroundColor: colors.background.surface,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 4,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '48%',
    backgroundColor: colors.background.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
  },
  gridChipSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.primaryLight,
  },
  metricSetupCard: {
    backgroundColor: colors.background.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricInputBox: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  planReviewCard: {
    backgroundColor: colors.accent.primaryLight,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(117, 97, 168, 0.25)',
  },
  planReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.sm,
  },
  planReviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planReviewBody: {
    gap: 8,
    marginTop: 4,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  planLabel: {
    width: 72,
  },
  planValue: {
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.background.canvas,
  },
});
