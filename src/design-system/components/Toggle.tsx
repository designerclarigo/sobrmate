import { useTheme, useThemedStyles } from '../theme';
import React, { useEffect, useRef } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { triggerHaptic } from '../../utils/haptics';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';

export interface ToggleProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      bounciness: 4,
      speed: 24,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const handlePress = () => {
    if (disabled) return;
    triggerHaptic('selection');
    onValueChange(!value);
  };

  const trackBg = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.background.muted, colors.accent.primary],
  });

  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 23],
  });

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackBg }]}>
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX: thumbTranslateX }] },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

const baseStyles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: radii.full,
    justifyContent: 'center',
    padding: 2,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
});
