import { useTheme } from '../theme';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { triggerHaptic } from '../../utils/haptics';
import { Text } from '../typography/Text';
import { navigationColors, navigationMetrics as metrics } from '../tokens/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../../utils/useReducedMotion';

export type TabKey = 'progress' | 'calendar' | 'milestones' | 'settings';

export interface TabItem {
  key: TabKey;
  label: string;
  icon: (props: { active: boolean; color: string; size: number }) => React.ReactNode;
}

interface BottomTabBarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  tabs: TabItem[];
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onSelectTab,
  tabs,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const [labelLines, setLabelLines] = useState<Partial<Record<TabKey, number>>>({});
  const palette = useMemo(() => isDark ? {
    canvas: colors.background.canvas, border: colors.border.subtle, active: colors.text.accent,
    inactive: colors.text.secondary, indicator: colors.accent.primaryLight,
    hover: colors.background.subtle, focus: colors.border.focus,
  } : navigationColors, [isDark, colors]);
  // Reserve equal label space so larger text never pushes just one icon upward.
  const labelHeight = Math.max(1, ...tabs.map(tab => labelLines[tab.key] ?? 1))
    * metrics.labelLineHeight * fontScale;
  const measureLabel = useCallback((key: TabKey, lines: number) => {
    setLabelLines(previous => previous[key] === lines ? previous : { ...previous, [key]: lines });
  }, []);
  const handlePress = (tabKey: TabKey) => {
    if (tabKey === currentTab) return;
    triggerHaptic('selection');
    onSelectTab(tabKey);
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.canvas, borderTopColor: palette.border,
      paddingLeft: insets.left, paddingRight: insets.right,
      paddingBottom: Math.max(metrics.minimumBottomPadding, insets.bottom) }]}>
      <View style={styles.bar}>
        {tabs.map(tab => <AnimatedTab key={tab.key} tab={tab} active={tab.key === currentTab}
          palette={palette} reducedMotion={reducedMotion} labelHeight={labelHeight}
          onLabelLayout={measureLabel} onPress={() => handlePress(tab.key)} />)}
      </View>
    </View>
  );
};

type NavigationPalette = { [K in keyof typeof navigationColors]: string };

function AnimatedTab({ tab, active, palette, reducedMotion, labelHeight, onLabelLayout, onPress }: {
  tab: TabItem; active: boolean; palette: NavigationPalette; reducedMotion: boolean; labelHeight: number;
  onLabelLayout: (key: TabKey, lines: number) => void; onPress: () => void;
}) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const inactiveOpacity = useMemo(() => progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), [progress]);
  const indicatorScale = useMemo(() => progress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }), [progress]);
  useEffect(() => {
    progress.stopAnimation();
    if (reducedMotion) { progress.setValue(active ? 1 : 0); pressScale.setValue(1); return; }
    Animated.timing(progress, { toValue: active ? 1 : 0, duration: metrics.stateDuration,
      easing: Easing.inOut(Easing.ease), useNativeDriver: true, isInteraction: false }).start();
    return () => progress.stopAnimation();
  }, [active, reducedMotion, progress, pressScale]);
  useEffect(() => () => pressScale.stopAnimation(), [pressScale]);
  const animatePress = (toValue: number) => {
    if (reducedMotion) return;
    Animated.timing(pressScale, { toValue, duration: metrics.pressDuration,
      easing: Easing.out(Easing.cubic), useNativeDriver: true, isInteraction: false }).start();
  };
  return <Animated.View style={[styles.item, { transform: [{ scale: pressScale }] }]}>
    <Pressable style={[styles.tabItem, hovered && { backgroundColor: palette.hover }]}
      onPress={onPress} onPressIn={() => animatePress(0.98)} onPressOut={() => animatePress(1)}
      onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      accessibilityRole="tab" accessibilityLabel={`Navigate to ${tab.label}`}
      accessibilityState={{ selected: active }} aria-selected={active}>
      <View style={styles.iconWrapper} pointerEvents="none" accessible={false}
        accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Animated.View style={[styles.indicator, { backgroundColor: palette.indicator,
          opacity: progress, transform: [{ scale: indicatorScale }] }]} />
        <Animated.View style={[styles.iconLayer, { opacity: inactiveOpacity }]}>
          {tab.icon({ active: false, color: palette.inactive, size: metrics.iconSize })}
        </Animated.View>
        <Animated.View style={[styles.iconLayer, { opacity: progress }]}>
          {tab.icon({ active: true, color: palette.active, size: metrics.iconSize })}
        </Animated.View>
      </View>
      <View style={[styles.labelContainer, { minHeight: labelHeight }]} pointerEvents="none"
        accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Animated.View style={{ opacity: inactiveOpacity }}>
          <Text weight="500" style={[styles.label, { color: palette.inactive }]}
            onTextLayout={event => onLabelLayout(tab.key, event.nativeEvent.lines.length)}>{tab.label}</Text>
        </Animated.View>
        <Animated.View style={[styles.activeLabel, { opacity: progress }]}>
          <Text weight="500" style={[styles.label, { color: palette.active }]}>{tab.label}</Text>
        </Animated.View>
      </View>
      {focused && <View pointerEvents="none" style={[styles.focusRing, { borderColor: palette.focus }]} />}
    </Pressable>
  </Animated.View>;
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    zIndex: 40,
  },
  bar: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: metrics.maxWidth,
    alignSelf: 'center',
    alignItems: 'stretch',
    gap: metrics.gap,
    paddingTop: metrics.paddingTop,
    paddingHorizontal: metrics.gutter,
  },
  item: { flex: 1, minWidth: 0 },
  tabItem: {
    flexGrow: 1,
    minHeight: metrics.tabHeight,
    borderRadius: metrics.tabRadius,
    alignItems: 'center',
    justifyContent: 'center',
    gap: metrics.gap,
  },
  iconWrapper: {
    width: metrics.indicatorWidth,
    height: metrics.indicatorHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: metrics.indicatorRadius,
  },
  indicator: { position:'absolute', top:0, bottom:0, left:0, right:0, borderRadius: metrics.indicatorRadius },
  iconLayer: { position:'absolute', top:0, bottom:0, left:0, right:0, alignItems:'center', justifyContent:'center' },
  labelContainer: { width:'100%' },
  activeLabel: { position:'absolute', top:0, left:0, right:0 },
  label: {
    width:'100%',textAlign:'center',
    fontSize: metrics.labelSize,
    lineHeight: metrics.labelLineHeight,
    letterSpacing: metrics.labelTracking,
  },
  focusRing: { position:'absolute', top:-2, bottom:-2, left:-2, right:-2,
    borderRadius:metrics.tabRadius+2, borderWidth:3 },
});
