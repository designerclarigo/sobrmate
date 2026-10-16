import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleProp, TouchableOpacity, ViewStyle } from 'react-native';
import { useReducedMotion } from '../../utils/useReducedMotion';

export function CalendarReveal({identity,children,style}:{identity:string;children:React.ReactNode;style?:StyleProp<ViewStyle>}) {
  const reduced=useReducedMotion();const value=useRef(new Animated.Value(1)).current;
  const translateY=useMemo(()=>value.interpolate({inputRange:[0,1],outputRange:[8,0]}),[value]);
  useEffect(()=>{
    if(reduced){value.setValue(1);return;}
    value.setValue(0);Animated.timing(value,{toValue:1,duration:320,easing:Easing.bezier(.2,.7,.2,1),useNativeDriver:true,isInteraction:false}).start();
    return()=>value.stopAnimation();
  },[identity,reduced,value]);
  return <Animated.View style={[style,{opacity:value,transform:[{translateY}]}]}>{children}</Animated.View>;
}

const AnimatedTouch=Animated.createAnimatedComponent(TouchableOpacity);
/** Reference press feedback runs on the native driver and honors reduced motion. */
export function CalendarPressable({style,onPressIn,onPressOut,...props}:React.ComponentProps<typeof TouchableOpacity>){
  const reduced=useReducedMotion(),scale=useRef(new Animated.Value(1)).current;
  useEffect(()=>()=>scale.stopAnimation(),[scale]);
  const animate=(toValue:number)=>{scale.stopAnimation();if(reduced){scale.setValue(1);return;}Animated.timing(scale,{toValue,duration:150,easing:Easing.bezier(.2,.7,.2,1),useNativeDriver:true,isInteraction:false}).start();};
  return <AnimatedTouch {...props} activeOpacity={props.activeOpacity??.8} style={[style,{transform:[{scale}]}]}
    onPressIn={event=>{animate(.98);onPressIn?.(event);}} onPressOut={event=>{animate(1);onPressOut?.(event);}}/>;
}
