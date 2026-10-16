import { useTheme, useThemedStyles } from '../design-system/theme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, ChevronLeft } from 'lucide-react-native';
import { Button } from '../design-system/components/Button';
import { Text } from '../design-system/typography/Text';
import { colors } from '../design-system/tokens/colors';
import { triggerHaptic } from '../utils/haptics';
import { useReducedMotion } from '../utils/useReducedMotion';
import { BrandMark, OnboardingIllustration } from './OnboardingIllustration';

const steps = [
  { kicker: 'A FRESH BEGINNING', title: 'A little change.', accent: 'A fuller life.', description: 'Make space for what matters. Build healthier habits, one kind choice at a time.' },
  { kicker: 'NOTICE YOUR PROGRESS', title: 'Small steps.', accent: 'Visible progress.', description: 'Track your days, reflect on your journey, and see the moments that add up.' },
  { kicker: 'MAKE IT YOUR OWN', title: 'Your journey.', accent: 'On your terms.', description: 'Set a meaningful intention. Celebrate each milestone. There is always room to begin again.' },
] as const;

export function OnboardingFlow({onComplete,initialStep=0,onStepChange}:{onComplete:()=>Promise<void>|void;initialStep?:0|1|2;onStepChange?:(step:0|1|2)=>Promise<void>}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState<0 | 1 | 2>(initialStep);
  const [moving, setMoving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const transitionInFlight = useRef(false);
  const completionInFlight = useRef(false);
  const mounted = useRef(true);
  const storyScroll = useRef<ScrollView>(null);
  const contentWidth = Math.max(180, Math.min(width, 390) - 56);
  const illustrationWidth = Math.min(342, contentWidth);
  const compact = height < 740;
  const illustrationHeight = compact ? 218 : 284;
  const titleSize = width < 360 ? 34 : 40;
  const page = steps[step];

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; opacity.stopAnimation(); translateX.stopAnimation(); };
  }, [opacity, translateX]);

  const moveTo = async(next: 0 | 1 | 2) => {
    if (transitionInFlight.current || completionInFlight.current || next === step) return;
    triggerHaptic('selection');
    setError('');
    transitionInFlight.current=true;setMoving(true);
    try{await onStepChange?.(next);}catch{setError('Could not save this welcome step. Please try again.');transitionInFlight.current=false;setMoving(false);return;}
    if(!mounted.current)return;
    if (reducedMotion) { setStep(next); storyScroll.current?.scrollTo({ y: 0, animated: false });transitionInFlight.current=false;setMoving(false); return; }
    const direction = next > step ? 1 : -1;
    const native = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 110, useNativeDriver: native }),
      Animated.timing(translateX, { toValue: -12 * direction, duration: 110, useNativeDriver: native }),
    ]).start(({ finished }) => {
      if (!mounted.current) return;
      if (!finished) { transitionInFlight.current = false; setMoving(false); return; }
      setStep(next);
      storyScroll.current?.scrollTo({ y: 0, animated: false });
      translateX.setValue(12 * direction);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: native }),
        Animated.timing(translateX, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: native }),
      ]).start(() => { if (mounted.current) { transitionInFlight.current = false; setMoving(false); } });
    });
  };

  const complete = async () => {
    if (completionInFlight.current || transitionInFlight.current) return;
    completionInFlight.current = true;
    setSaving(true); setError('');
    triggerHaptic('medium');
    try { await onComplete(); }
    catch { if (mounted.current) setError('Could not save your welcome progress. Please try again.'); }
    finally { completionInFlight.current = false; if (mounted.current) setSaving(false); }
  };

  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
      <View style={styles.brandRow}><BrandMark size={28} /><Text variant="bodyMedium" style={styles.brandName} numberOfLines={1}>SobrMate</Text></View>
      <TouchableOpacity onPress={() => void complete()} disabled={saving || moving} accessibilityRole="button" accessibilityLabel="Skip onboarding and get started" accessibilityState={{ disabled: saving || moving }} style={styles.skip} activeOpacity={0.65}>
        <Text variant="body" color="secondary" style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>

    <ScrollView ref={storyScroll} style={styles.scroll} contentContainerStyle={[styles.storyContent, compact && styles.compactContent]} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.story, { opacity, transform: [{ translateX }] }]}>
        <View style={[styles.illustration, { height: illustrationHeight, marginBottom: compact ? 16 : 28 }]}>
          <OnboardingIllustration step={step} width={illustrationWidth} height={illustrationHeight} />
        </View>
        <View style={styles.kickerRow}><View style={styles.kickerLine} /><Text variant="subcaption" color="accent" weight="500" style={styles.kicker}>{page.kicker}</Text></View>
        <View style={styles.headline} accessible accessibilityRole="header" accessibilityLabel={`${page.title} ${page.accent}`}>
          <Text variant="display" serif style={{ fontSize: titleSize, lineHeight: titleSize + 5, letterSpacing: -1.2 }}>{page.title}</Text>
          <Text variant="display" serif color="accent" style={{ fontSize: titleSize, lineHeight: titleSize + 5, letterSpacing: -1.2, fontStyle: 'italic' }}>{page.accent}</Text>
        </View>
        <Text variant="body" color="secondary" style={styles.description}>{page.description}</Text>
      </Animated.View>
    </ScrollView>

    <View style={styles.footer}>
      <View style={styles.navigationRow}>
        <View style={styles.dots} accessible accessibilityRole="progressbar" accessibilityLabel="Welcome tour progress" accessibilityValue={{ min: 1, max: 3, now: step + 1, text: `Step ${step + 1} of 3` }}>
          {steps.map((_, index) => <View key={index} style={[styles.dot, index === step && styles.activeDot]} />)}
        </View>
        {step > 0 ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to previous welcome screen" disabled={moving || saving} onPress={() => moveTo((step - 1) as 0 | 1)} activeOpacity={0.65} style={styles.back}>
          <ChevronLeft size={16} color={colors.accent.primary} strokeWidth={1.5} /><Text variant="body" color="accent" style={styles.backText}>Back</Text>
        </TouchableOpacity> : <Text variant="subcaption" color="tertiary" style={styles.pageNumber}>01 / 03</Text>}
      </View>
      {!!error && <Text variant="caption" color="rose" accessibilityRole="alert" style={styles.error}>{error}</Text>}
      <Button label={step === 2 ? 'Get Started' : 'Next'} size="lg" fullWidth contentAlignment="space-between" disabled={moving} loading={saving} iconRight={<ArrowRight size={19} color={colors.text.inverse} strokeWidth={1.6} />} onPress={() => { if (step === 2) void complete(); else moveTo((step + 1) as 1 | 2); }} style={styles.action} />
      <Text variant="subcaption" color="tertiary" align="center" style={styles.reassurance}>At your pace. Always.</Text>
    </View>
  </SafeAreaView>;
}

const baseStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background.canvas },
  header: { width: '100%', maxWidth: 390, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 8, minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandName: { fontSize: 16, lineHeight: 23, letterSpacing: -0.4, flexShrink: 1 },
  skip: { minWidth: 44, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  skipText: { fontSize: 14 },
  scroll: { flex: 1, width: '100%', maxWidth: 390, alignSelf: 'center' },
  storyContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  compactContent: { paddingTop: 8, paddingBottom: 16 },
  story: { width: '100%' },
  illustration: { alignItems: 'center', justifyContent: 'center' },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 14 },
  kickerLine: { width: 22, height: 1, backgroundColor: '#B8A5D6' },
  kicker: { fontSize: 13, lineHeight: 18, letterSpacing: 1.8, flexShrink: 1 },
  headline: { marginBottom: 17 },
  description: { fontSize: 15, lineHeight: 24 },
  footer: { width: '100%', maxWidth: 390, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  navigationRow: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#D9D0E4' },
  activeDot: { width: 23, backgroundColor: colors.accent.primary },
  back: { flexDirection: 'row', alignItems: 'center', gap: 3, minHeight: 44, paddingLeft: 12 },
  backText: { fontSize: 14 },
  pageNumber: { fontSize: 13, letterSpacing: 0.6 },
  action: { borderRadius: 18 },
  reassurance: { fontSize: 13, lineHeight: 18, paddingTop: 12 },
  error: { marginBottom: 10 },
});
