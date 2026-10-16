import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Animated,Easing,StyleProp,TouchableOpacity,View,ViewStyle} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useMilestoneAppearance,useMilestoneReducedMotion as useReducedMotion} from './milestoneAppearance';

const AnimatedTouch=Animated.createAnimatedComponent(TouchableOpacity);
export function MilestonePressable({style,onPressIn,onPressOut,...props}:React.ComponentProps<typeof TouchableOpacity>){
 const reduced=useReducedMotion(),value=useRef(new Animated.Value(1)).current;
 useEffect(()=>()=>value.stopAnimation(),[value]);
 const animate=(toValue:number)=>{value.stopAnimation();if(reduced){value.setValue(1);return;}Animated.timing(value,{toValue,duration:200,easing:Easing.bezier(.22,1,.36,1),useNativeDriver:true,isInteraction:false}).start();};
 return <AnimatedTouch {...props} activeOpacity={props.activeOpacity??.85} style={[style,{transform:[{scale:value}]}]}
  onPressIn={event=>{animate(.985);onPressIn?.(event);}} onPressOut={event=>{animate(1);onPressOut?.(event);}}/>;
}
export const MilestoneReveal=React.memo(function MilestoneReveal({identity,children,style}:{identity:string;children:React.ReactNode;style?:StyleProp<ViewStyle>}){
 const reduced=useReducedMotion(),value=useRef(new Animated.Value(1)).current;
 const translateY=useMemo(()=>value.interpolate({inputRange:[0,1],outputRange:[8,0]}),[value]);
 useEffect(()=>{if(reduced){value.setValue(1);return;}value.setValue(0);const animation=Animated.timing(value,{toValue:1,duration:320,easing:Easing.bezier(.22,1,.36,1),useNativeDriver:true,isInteraction:false});animation.start();return()=>animation.stop();},[identity,reduced,value]);
 return <Animated.View style={[style,{opacity:value,transform:[{translateY}]}]}>{children}</Animated.View>;
});
export const MilestoneProgress=React.memo(function MilestoneProgress({progress,label}:{progress:number;label:string}){
 const p=useMilestoneAppearance(),reduced=useReducedMotion(),value=useRef(new Animated.Value(0)).current;
 const [width,setWidth]=useState(1);const fraction=Math.min(1,Math.max(0,progress/100));
 const translateX=useMemo(()=>value.interpolate({inputRange:[0,1],outputRange:[-width/2,0]}),[value,width]);
 useEffect(()=>{if(reduced){value.setValue(fraction);return;}const animation=Animated.timing(value,{toValue:fraction,duration:450,easing:Easing.bezier(.22,1,.36,1),useNativeDriver:true,isInteraction:false});animation.start();return()=>animation.stop();},[fraction,reduced,value]);
 return <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{min:0,max:100,now:Math.round(progress)}} onLayout={event=>setWidth(event.nativeEvent.layout.width)}
  style={{height:5,backgroundColor:p.progressTrack,borderRadius:8,overflow:'hidden'}}>
  <Animated.View style={{width:'100%',height:5,transform:[{translateX},{scaleX:value}]}}><LinearGradient colors={p.progress} start={{x:0,y:.5}} end={{x:1,y:.5}} style={{flex:1,borderRadius:8}}/></Animated.View>
 </View>;
});
