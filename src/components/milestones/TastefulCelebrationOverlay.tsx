import React,{useEffect,useMemo,useRef} from 'react';
import {View,StyleSheet,Animated,Easing} from 'react-native';
import {Sparkles,Star} from 'lucide-react-native';
import {useTheme} from '../../design-system/theme';
import {triggerHaptic} from '../../utils/haptics';
import {useMilestoneReducedMotion as useReducedMotion} from './milestoneAppearance';

interface Props{active:boolean;onAnimationEnd?:()=>void;accentColor?:string;badgeTitle?:string}
export const TastefulCelebrationOverlay=React.memo(function TastefulCelebrationOverlay({active,onAnimationEnd,accentColor}:Props){
 const {colors}=useTheme(),reduced=useReducedMotion(),finish=useRef(onAnimationEnd);finish.current=onAnimationEnd;
 const gold=accentColor||colors.accent.champagne;
 const aura=useMemo(()=>({scale:new Animated.Value(.6),opacity:new Animated.Value(0)}),[]);
 const particles=useMemo(()=>Array.from({length:16},(_,i)=>({
  id:i,x:new Animated.Value(0),y:new Animated.Value(0),scale:new Animated.Value(0),opacity:new Animated.Value(0),rotation:new Animated.Value(0),
  angle:i/16*Math.PI*2,distance:80+i%5*19,duration:1400+i%4*160,size:8+i%3*4,
  color:[gold,colors.accent.primary,colors.accent.champagneLight,colors.accent.success][i%4],
 })),[gold,colors.accent.primary,colors.accent.champagneLight,colors.accent.success]);
 useEffect(()=>{
  if(!active)return;
  if(reduced){finish.current?.();return;}
  triggerHaptic('medium');aura.scale.setValue(.6);aura.opacity.setValue(.35);
  const wave=Animated.parallel([
   Animated.timing(aura.scale,{toValue:1.7,duration:1800,easing:Easing.out(Easing.cubic),useNativeDriver:true,isInteraction:false}),
   Animated.timing(aura.opacity,{toValue:0,duration:1800,easing:Easing.out(Easing.cubic),useNativeDriver:true,isInteraction:false}),
  ]);
  const blooms=particles.map((p,i)=>{
   p.x.setValue(0);p.y.setValue(0);p.scale.setValue(.1);p.opacity.setValue(1);p.rotation.setValue(0);
   const timing=(value:Animated.Value,toValue:number,duration=p.duration)=>Animated.timing(value,{toValue,duration,easing:Easing.out(Easing.cubic),useNativeDriver:true,isInteraction:false});
   return Animated.parallel([
    timing(p.x,Math.cos(p.angle)*p.distance),timing(p.y,Math.sin(p.angle)*p.distance-25),
    Animated.sequence([timing(p.scale,1.1,360),timing(p.scale,.65,p.duration-360)]),
    Animated.sequence([Animated.delay(p.duration*.35),timing(p.opacity,0,p.duration*.65)]),
    timing(p.rotation,i%2?90:-90),
   ]);
  });
  const animation=Animated.parallel([wave,...blooms]);animation.start(({finished})=>{if(finished)finish.current?.();});
  return()=>animation.stop();
 },[active,reduced,particles,aura]);
 if(!active)return null;
 return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.container}>
  <Animated.View style={[styles.aura,{borderColor:gold,opacity:aura.opacity,transform:[{scale:aura.scale}]}]}/>
  {particles.map(p=><Animated.View key={p.id} style={[styles.particle,{opacity:p.opacity,transform:[{translateX:p.x},{translateY:p.y},{scale:p.scale},{rotate:p.rotation.interpolate({inputRange:[-90,90],outputRange:['-90deg','90deg']})}]}]}>
   {p.id%3===0?<Sparkles size={p.size} color={p.color}/>:p.id%3===1?<Star size={p.size} color={p.color} fill={p.color}/>:<View style={{width:p.size,height:p.size,borderRadius:p.size/2,backgroundColor:p.color}}/>}
  </Animated.View>)}
 </View>;
});
const styles=StyleSheet.create({
 container:{position:'absolute',top:0,left:0,right:0,bottom:0,alignItems:'center',justifyContent:'center',zIndex:99},
 aura:{position:'absolute',width:140,height:140,borderRadius:70,borderWidth:1.5},particle:{position:'absolute'},
});
