import { useTheme, useThemedStyles } from '../theme';
import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  Modal as RNModal,
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
  StyleProp,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text } from '../typography/Text';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';
import { shadows } from '../tokens/shadows';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { ScreenVisibilityContext } from '../../components/ScreenVisibility';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  description,
  icon,
  children,
  actions,
  style,
}) => {
  const styles = useThemedStyles(baseStyles);

  const reducedMotion = useReducedMotion();
  const screenVisible = useContext(ScreenVisibilityContext);
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) {
      fadeAnim.setValue(visible ? 1 : 0);
      scaleAnim.setValue(visible ? 1 : 0.92);
      return;
    }
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          bounciness: 4,
          speed: 20,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 160,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
    return () => { fadeAnim.stopAnimation(); scaleAnim.stopAnimation(); };
  }, [visible, reducedMotion, fadeAnim, scaleAnim]);

  return (
    <RNModal
      visible={visible && screenVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlayContainer}>
        {/* Backdrop Scrim */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Modal Dialog Card */}
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.dialogCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
            style,
          ]}
        >
          {icon && <View style={styles.iconContainer}>{icon}</View>}

          {title && (
            <Text variant="title3" color="primary" weight="500" align="center" style={styles.title}>
              {title}
            </Text>
          )}

          {description && (
            <Text variant="body" color="secondary" align="center" style={styles.description}>
              {description}
            </Text>
          )}

          {children && <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.bodyContent}>{children}</ScrollView>}

          {actions && <View style={styles.actionsContainer}>{actions}</View>}
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const baseStyles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.overlay,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '92%',
    backgroundColor: colors.background.surface,
    borderRadius: radii.xxl, // 24px
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadows.floating,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    lineHeight: 22,
    marginBottom: spacing.base,
  },
  bodyContent: {
    flexShrink: 1,
    marginVertical: spacing.sm,
  },
  actionsContainer: {
    marginTop: spacing.base,
  },
});
