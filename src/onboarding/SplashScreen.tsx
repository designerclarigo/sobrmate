import { useTheme, useThemedStyles } from '../design-system/theme';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../design-system/typography/Text';
import { colors } from '../design-system/tokens/colors';
import { useReducedMotion } from '../utils/useReducedMotion';
import { BrandMark } from './OnboardingIllustration';

export function SplashScreen({ onFinish, returning = false }: { onFinish: () => void; returning?: boolean }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const reducedMotion = useReducedMotion();
  const compact = useWindowDimensions().height < 600;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.97)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const finished = useRef(false);
  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: reducedMotion ? 0 : 250, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(scale, { toValue: 1, duration: reducedMotion ? 0 : 350, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(progress, { toValue: 1, duration: reducedMotion ? 0 : returning ? 500 : 1000, useNativeDriver: Platform.OS !== 'web' }),
    ]);
    entrance.start();
    const timer = setTimeout(finish, reducedMotion ? 120 : returning ? 600 : 1100);
    return () => { clearTimeout(timer); entrance.stop(); };
  }, [finish, opacity, scale, progress, reducedMotion, returning]);

  return <SafeAreaView style={styles.screen}>
    <Pressable style={styles.tapSurface} onPress={finish} accessibilityRole="button" accessibilityLabel="SobrMate. A fresh start, one day at a time. Tap to continue.">
      <Animated.View style={[styles.center, { opacity, transform: [{ scale }] }]}>
        <View style={styles.brandGroup}>
          <LinearGradient colors={[colors.background.subtle, colors.background.subtle, colors.background.canvas]} style={styles.halo} pointerEvents="none" />
          <View style={[styles.mark, compact && { marginBottom: 16 }]}><BrandMark size={compact ? 64 : 88} /></View>
          <Text variant="displayLarge" serif align="center" style={[styles.brand, compact && { fontSize: 34, lineHeight: 42, marginBottom: 12 }]}>SobrMate</Text>
          <Text variant="body" color="secondary" align="center" style={styles.tagline}>{'A fresh start,\none day at a time.'}</Text>
        </View>
      </Animated.View>
      <View style={[styles.footer, compact && { paddingBottom: 12, paddingTop: 10, gap: 10 }]}>
        <Animated.View style={[styles.loadingLine, { transform: [{ scaleX: progress }] }]} />
        <Text variant="subcaption" color="tertiary" align="center" style={styles.footerText}>A LITTLE BETTER, EVERY DAY</Text>
      </View>
    </Pressable>
  </SafeAreaView>;
}

const baseStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background.canvas },
  tapSurface: { flex: 1, paddingHorizontal: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  brandGroup: { alignItems: 'center', width: '100%', maxWidth: 330 },
  halo: { position: 'absolute', top: -112, width: 282, height: 340, borderTopLeftRadius: 141, borderTopRightRadius: 141, borderWidth: 1, borderColor: colors.border.subtle },
  mark: { marginBottom: 25, shadowColor: '#91809F', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.10, shadowRadius: 20 },
  brand: { fontSize: 44, lineHeight: 54, letterSpacing: -1.5, marginBottom: 18 },
  tagline: { fontSize: 15, lineHeight: 24 },
  footer: { alignItems: 'center', paddingBottom: 30, paddingTop: 18, gap: 16 },
  loadingLine: { width: 48, height: 2, borderRadius: 1, backgroundColor: colors.accent.primary },
  footerText: { fontSize: 13, lineHeight: 18, letterSpacing: 2 },
});
