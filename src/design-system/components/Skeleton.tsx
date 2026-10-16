import React,{useEffect,useRef} from 'react';
import { Animated,View } from 'react-native';
import { useTheme } from '../theme';
import { useReducedMotion } from '../../utils/useReducedMotion';
export function Skeleton({height=24,width='100%'}:{height?:number;width?:number|`${number}%`}){
 const {colors}=useTheme();const reduced=useReducedMotion();const opacity=useRef(new Animated.Value(.65)).current;
 useEffect(()=>{if(reduced){opacity.setValue(.65);return;}const animation=Animated.loop(Animated.sequence([Animated.timing(opacity,{toValue:.35,duration:800,useNativeDriver:true}),Animated.timing(opacity,{toValue:.75,duration:800,useNativeDriver:true})]));animation.start();return()=>animation.stop();},[reduced,opacity]);
 return <Animated.View accessible={false} style={{height,width,borderRadius:16,backgroundColor:colors.border.subtle,opacity}}/>;
}
export function DashboardSkeleton(){return <View accessibilityLabel="Loading your saved journey" style={{width:'100%',maxWidth:350,gap:16}}><Skeleton width="60%" height={32}/><Skeleton height={180}/><View style={{gap:16,flexDirection:'row'}}><View style={{flex:1}}><Skeleton height={100}/></View><View style={{flex:1}}><Skeleton height={100}/></View></View></View>;}
