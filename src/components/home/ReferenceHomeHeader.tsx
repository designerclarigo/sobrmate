import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { ChevronDown, Crown } from 'lucide-react-native';
import { BrandMark } from '../../onboarding/OnboardingIllustration';
import { Habit } from '../../data/types';
import { usePremium } from '../../data/premium';
import {authenticationMode} from '../../auth/runtime';
import { triggerHaptic } from '../../utils/haptics';
import { HomePressable } from './HomePressable';
import { HomePalette, HomeText as Text, useHomeAppearance, useHomeStyles } from './homeAppearance';

/** Separate from Calendar's header; existing premium routes stay intact. */
export function ReferenceHomeHeader({ habit, onChooseTracker, onNewTracker }: {
  habit: Habit | null; onChooseTracker: () => void; onNewTracker: () => void;
}) {
  const palette = useHomeAppearance();
  const styles = useHomeStyles(makeStyles);
  const premium = usePremium();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale > 1.2;
  const selector = <HomePressable containerStyle={[styles.selector, stacked && styles.stackedSelector]}
    style={[styles.trigger, stacked && styles.stackedTrigger]} hoverColor={palette.hover}
    onPress={habit ? onChooseTracker : onNewTracker}
    accessibilityLabel={habit ? `${habit.title}. Choose tracker` : 'Add your first tracker'}>
    <Text numberOfLines={1} style={styles.habit}>{habit?.title || 'Choose a habit'}</Text>
    <ChevronDown size={12} strokeWidth={1.6} color={palette.selector} />
  </HomePressable>;
  return <View style={styles.container}><View style={[styles.content, stacked && styles.wrapped]}>
    <View style={[styles.brand, stacked && styles.grow]}><BrandMark size={27} />
      <View><Text weight="600" style={styles.brandName}>SobrMate</Text>{authenticationMode==='demo'&&<Text style={{fontSize:12,lineHeight:16,color:palette.selector}}>Demo workspace</Text>}</View>
    </View>
    {!stacked && selector}
    <HomePressable style={styles.pro} disabled={premium.isLoading}
      accessibilityState={{ disabled: premium.isLoading }}
      accessibilityLabel={premium.isPremium ? 'Manage Premium, development mock membership' : 'Explore Premium, development mock mode'}
      onPress={() => { triggerHaptic('light'); premium.isPremium ? premium.openManagement() : premium.openPaywall(); }}>
      <Crown size={15} strokeWidth={1.6} color={palette.gold} />
      <Text weight="600" style={styles.proLabel}>PRO</Text>
    </HomePressable>
    {stacked && selector}
  </View></View>;
}
const makeStyles = (p: HomePalette) => ({
  container: { backgroundColor: p.canvas, borderBottomWidth: 1, borderBottomColor: p.headerBorder },
  content: { width: '100%' as const, maxWidth: 400, alignSelf: 'center' as const,
    paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row' as const,
    alignItems: 'center' as const, justifyContent: 'space-between' as const, gap: 8 },
  wrapped: { flexWrap: 'wrap' as const }, grow: { flex: 1 },
  brand: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 7, flexShrink: 0 },
  brandName: { fontSize: 13, lineHeight: 20, letterSpacing: -0.4 },
  selector: { flex: 1, minWidth: 0, maxWidth: 123 },
  trigger: { minHeight: 44, borderRadius: 14, flexDirection: 'row' as const,
    alignItems: 'center' as const, justifyContent: 'center' as const, gap: 6, paddingHorizontal: 8 },
  habit: { flexShrink: 1, fontSize: 12, lineHeight: 18, color: p.selector },
  stackedSelector: { flexBasis: '100%' as const, minWidth: '100%' as const, maxWidth: '100%' as const },
  stackedTrigger: { justifyContent: 'space-between' as const, backgroundColor: p.hover },
  pro: { minHeight: 44, minWidth: 64, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1,
    borderColor: p.goldBorder, backgroundColor: p.goldSurface,
    flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 6 },
  proLabel: { color: p.gold, fontSize: 12, lineHeight: 18, letterSpacing: 1 },
});
