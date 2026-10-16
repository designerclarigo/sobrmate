import { useTheme, useThemedStyles } from '../theme';
import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../typography/Text';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';
import { shadows } from '../tokens/shadows';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { ScreenVisibilityContext } from '../../components/ScreenVisibility';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  presentation?: 'bottom' | 'center';
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  style,
  presentation = 'bottom',
}) => {
  const styles = useThemedStyles(baseStyles);

  const insets = useSafeAreaInsets();
  const screenVisible = useContext(ScreenVisibilityContext);
  const reducedMotion = useReducedMotion();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) {
      fadeAnim.setValue(visible ? 1 : 0);
      slideAnim.setValue(visible ? 0 : 400);
      return;
    }
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          bounciness: 3,
          speed: 18,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 180,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
    return () => { fadeAnim.stopAnimation(); slideAnim.stopAnimation(); };
  }, [visible, reducedMotion, fadeAnim, slideAnim]);

  return (
    <Modal
      visible={visible && screenVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.overlayContainer, presentation === 'center' && { justifyContent: 'center', paddingHorizontal: 12 }]}>
        {/* Backdrop Scrim */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sheet Surface */}
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheetContainer,
            { width: '100%', maxWidth: 600, alignSelf: 'center', paddingBottom: Math.max(16, insets.bottom) },
            { transform: [{ translateY: slideAnim }] },
            style,
            presentation === 'center' && { borderRadius: 28, maxWidth: 390 },
          ]}
        >
          {/* Drag Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          {(title || subtitle) && (
            <View style={styles.header}>
              {title && (
                <Text variant="title3" color="primary" weight="500">
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text variant="caption" color="secondary" style={styles.subtitle}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}

          {/* Content Body */}
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }} contentContainerStyle={styles.content}>{children}</ScrollView>

          {/* Footer Actions */}
          {footer && <View style={styles.footer}>{footer}</View>}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const baseStyles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.overlay,
  },
  sheetContainer: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radii.sheet, // 28px
    borderTopRightRadius: radii.sheet,
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxxl : spacing.xl,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    maxHeight: '85%',
    ...shadows.floating,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    borderRadius: radii.full,
    backgroundColor: colors.border.medium,
  },
  header: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginTop: 2,
  },
  content: {
    marginVertical: spacing.sm,
  },
  footer: {
    marginTop: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
});
