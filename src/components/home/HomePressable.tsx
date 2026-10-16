import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { useReducedMotion } from '../../utils/useReducedMotion';

type HomePressableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  hoverColor?: string;
};

/** Reference press feedback uses only native transform animations. */
export function HomePressable({ style, containerStyle, hoverColor, onPressIn, onPressOut,
  onHoverIn, onHoverOut, disabled, ...props }: HomePressableProps) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (reduced || disabled) scale.setValue(1);
    return () => scale.stopAnimation();
  }, [reduced, disabled, scale]);
  const animate = (value: number) => {
    if (reduced || disabled) return;
    Animated.timing(scale, { toValue: value, duration: 200,
      easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: true }).start();
  };
  return <Animated.View style={[containerStyle, { transform: [{ scale }] }]}>
    <Pressable {...props} disabled={disabled} accessibilityRole={props.accessibilityRole ?? 'button'}
      style={[style, hovered && !disabled && hoverColor ? { backgroundColor: hoverColor } : undefined]}
      onPressIn={event => { animate(0.985); onPressIn?.(event); }}
      onPressOut={event => { animate(1); onPressOut?.(event); }}
      onHoverIn={event => { setHovered(true); onHoverIn?.(event); }}
      onHoverOut={event => { setHovered(false); onHoverOut?.(event); }} />
  </Animated.View>;
}
