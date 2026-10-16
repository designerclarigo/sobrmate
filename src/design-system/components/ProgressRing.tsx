import { useTheme, useThemedStyles } from '../theme';
import React,{useEffect,useRef} from 'react';
import { View, StyleSheet, ViewStyle,Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '../tokens/colors';
import { useReducedMotion } from '../../utils/useReducedMotion';
const AnimatedCircle=Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 to 1
  accentColor?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size = 150,
  strokeWidth = 9,
  progress,
  accentColor,
  backgroundColor,
  children,
  style,
}) => {
  const styles = useThemedStyles(baseStyles);
  const {colors}=useTheme();const reduced=useReducedMotion();

  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - clampedProgress * circumference;
  const offset=useRef(new Animated.Value(circumference)).current;
  useEffect(()=>{if(reduced){offset.setValue(strokeDashoffset);return;}const animation=Animated.timing(offset,{toValue:strokeDashoffset,duration:380,useNativeDriver:false});animation.start();return()=>animation.stop();},[strokeDashoffset,reduced,offset]);

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {/* Subtle Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor||colors.background.subtle}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Accent Stroke */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={accentColor||colors.accent.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const baseStyles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
