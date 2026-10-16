import React,{useContext,useEffect,useMemo,useRef,useState} from 'react';
import {ActivityIndicator,Animated,Easing,Modal,Pressable,ScrollView,StyleSheet,View,useWindowDimensions} from 'react-native';
import {Check,ChevronDown,Crown,Plus} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {Habit} from '../../data/types';
import {useRecoveryStore} from '../../data/store';
import {usePremium} from '../../data/premium';
import {BrandMark} from '../../onboarding/OnboardingIllustration';
import {triggerHaptic} from '../../utils/haptics';
import {ScreenVisibilityContext} from '../ScreenVisibility';
import {MilestoneHabitIcon} from './MilestoneHabitIcon';
import {MilestonePressable} from './MilestoneMotion';
import {MilestoneText as Text,useMilestoneAppearance,useMilestoneReducedMotion} from './milestoneAppearance';

/** Reference dropdown scoped to Milestones; tracker persistence and premium navigation are reused. */
export function MilestonesTrackerHeader({habit}:{habit:Habit|null}){
 const p=useMilestoneAppearance(),router=useRouter(),premium=usePremium(),{habits,setActiveHabitId}=useRecoveryStore();
 const dimensions=useWindowDimensions(),insets=useSafeAreaInsets(),focused=useContext(ScreenVisibilityContext),reduced=useMilestoneReducedMotion();
 const anchor=useRef<View>(null),flight=useRef(false),opening=useRef(false),motion=useRef(new Animated.Value(0)).current;
 const [visible,setVisible]=useState(false),[mounted,setMounted]=useState(false),[busy,setBusy]=useState(''),[error,setError]=useState(''),[position,setPosition]=useState({left:16,top:80});
 const stacked=dimensions.width<300||dimensions.fontScale>1.2;
 const menuWidth=Math.min(285,dimensions.width-insets.left-insets.right-32);
 const menuHeight=Math.max(100,dimensions.height-insets.bottom-position.top-16);
 const translateY=useMemo(()=>motion.interpolate({inputRange:[0,1],outputRange:[4,0]}),[motion]);
 const rotation=useMemo(()=>motion.interpolate({inputRange:[0,1],outputRange:['0deg','180deg']}),[motion]);
 const close=()=>{if(!flight.current){opening.current=false;setVisible(false);}};
 useEffect(()=>{if(!focused){opening.current=false;setVisible(false);}},[focused]);
 useEffect(()=>{opening.current=false;setVisible(false);},[dimensions.width,dimensions.height,dimensions.fontScale]);
 useEffect(()=>{
  motion.stopAnimation();
  if(reduced){setMounted(visible);motion.setValue(visible?1:0);return;}
  if(visible){setMounted(true);motion.setValue(0);}
  const animation=Animated.timing(motion,{toValue:visible?1:0,duration:visible?200:150,easing:Easing.bezier(.22,1,.36,1),useNativeDriver:true,isInteraction:false});
  let canceled=false;animation.start(({finished})=>{if(finished&&!canceled&&!visible)setMounted(false);});
  return()=>{canceled=true;animation.stop();};
 },[motion,reduced,visible]);
 const add=()=>{if(flight.current)return;opening.current=false;setVisible(false);router.push('/habit/new');};
 const open=()=>{
  if(flight.current||opening.current)return;
  if(visible){close();return;}
  if(!habit){add();return;}
  opening.current=true;
  anchor.current?.measureInWindow((x,y,width,height)=>{
   if(!opening.current)return;
   opening.current=false;setError('');
   setPosition({left:Math.max(insets.left+16,Math.min(x+width+44-menuWidth,dimensions.width-insets.right-16-menuWidth)),top:Math.min(y+height+9,dimensions.height-insets.bottom-156)});
   setVisible(true);
  });
 };
 const choose=async(id:string)=>{
  if(flight.current)return;flight.current=true;setBusy(id);setError('');
  try{await setActiveHabitId(id);setVisible(false);}
  catch(e){setError(e instanceof Error?e.message:'Unable to switch trackers. Please try again.');}
  finally{flight.current=false;setBusy('');}
 };
 const selector=<View ref={anchor} collapsable={false} style={[styles.selector,{maxWidth:dimensions.width>=640?113:123},stacked&&styles.stackedSelector]}>
  <MilestonePressable onPress={open} accessibilityRole="button" accessibilityLabel={habit?habit.title+'. Choose tracker':'Add your first tracker'} accessibilityState={{expanded:visible}} style={[styles.trigger,visible&&{backgroundColor:p.soft},stacked&&{width:'100%',justifyContent:'space-between',backgroundColor:p.soft}]}>
   <Text numberOfLines={1} style={{fontSize:11,lineHeight:16.5,maxWidth:stacked?undefined:dimensions.width>=640?64:80,flexShrink:1,color:p.headerSelector}}>{habit?.title||'Choose a habit'}</Text>
   <Animated.View style={{transform:[{rotate:rotation}]}}><ChevronDown size={12} strokeWidth={1.6} color={p.headerSelector}/></Animated.View>
  </MilestonePressable>
 </View>;
 return <>
  <View style={{backgroundColor:p.canvas,borderBottomWidth:1,borderBottomColor:p.headerBorder}}><View style={[styles.header,stacked&&{flexWrap:'wrap'}]}>
   <View style={[styles.brand,stacked&&{flex:1}]}><BrandMark size={27}/><Text weight="600" style={{fontSize:13,lineHeight:19.5,letterSpacing:-.4}}>SobrMate</Text></View>
   {!stacked&&selector}
   <MilestonePressable disabled={premium.isLoading} accessibilityRole="button" accessibilityState={{disabled:premium.isLoading}} accessibilityLabel={premium.isPremium?'Manage Premium, development mock membership':'Explore Premium, development mock mode'} onPress={()=>{triggerHaptic('light');premium.isPremium?premium.openManagement():premium.openPaywall();}} style={[styles.pro,{backgroundColor:p.headerGoldSurface,borderColor:p.headerGoldBorder}]}>
    <Crown size={15} strokeWidth={1.6} color={p.headerGold}/><Text weight="600" style={{fontSize:9,lineHeight:13.5,letterSpacing:1,color:p.headerGold}}>PRO</Text>
   </MilestonePressable>
   {stacked&&selector}
  </View></View>
  <Modal visible={mounted&&focused} transparent statusBarTranslucent navigationBarTranslucent animationType="none" onRequestClose={close}>
   <View style={{flex:1}}><Pressable style={StyleSheet.absoluteFill} disabled={!!busy} onPress={close} accessibilityRole="button" accessibilityLabel="Close tracker menu"/>
    <Animated.View accessibilityViewIsModal accessibilityElementsHidden={!visible} importantForAccessibility={visible?'auto':'no-hide-descendants'} pointerEvents={visible?'auto':'none'} style={[styles.menu,{left:position.left,top:position.top,width:menuWidth,maxHeight:menuHeight,backgroundColor:p.surface,borderColor:p.menuBorder,opacity:motion,transform:[{translateY}]}]}>
     <Text weight="400" style={{fontSize:9,lineHeight:13.5,letterSpacing:1.7,color:p.menuKicker,marginTop:4,marginHorizontal:10,marginBottom:12}}>YOUR TRACKERS</Text>
     <ScrollView showsVerticalScrollIndicator={false} style={{flexShrink:1,maxHeight:Math.min(dimensions.height*.4,Math.max(49,menuHeight-108))}} contentContainerStyle={{gap:4}} keyboardShouldPersistTaps="handled">
      {habits.map(item=>{const selected=item.id===habit?.id,color=selected?p.primary:p.menuInk;return <MilestonePressable key={item.id} disabled={!!busy} accessibilityRole="button" accessibilityLabel={'Select '+item.title} accessibilityState={{selected,disabled:!!busy}} onPress={()=>{void choose(item.id);}} style={[styles.option,{backgroundColor:selected?p.soft:'transparent'},dimensions.fontScale>1.2&&{paddingVertical:8}]}>
       <MilestoneHabitIcon habit={item} size={17} color={color}/><Text weight="500" numberOfLines={dimensions.fontScale>1.2?2:1} style={{flex:1,fontSize:12,lineHeight:18,color}}>{item.title}</Text>
       {busy===item.id?<ActivityIndicator size="small" color={p.primary}/>:selected?<Check size={14} strokeWidth={1.7} color={p.primary}/>:null}
      </MilestonePressable>;})}
     </ScrollView>
     {!!error&&<Text color="rose" accessibilityRole="alert" style={{fontSize:12,lineHeight:18,marginTop:12}}>{error}</Text>}
     <MilestonePressable disabled={!!busy} accessibilityRole="button" accessibilityLabel="Add a tracker" onPress={add} style={[styles.add,{borderTopColor:p.menuDivider}]}>
      <Plus size={16} strokeWidth={1.6} color={p.menuAdd}/><Text style={{fontSize:12,lineHeight:18,color:p.menuAdd,flexShrink:1}}>Add a tracker</Text>
     </MilestonePressable>
    </Animated.View>
   </View>
  </Modal>
 </>;
}
const styles=StyleSheet.create({
 header:{width:'100%',maxWidth:400,alignSelf:'center',paddingHorizontal:16,paddingVertical:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
 brand:{flexDirection:'row',alignItems:'center',gap:7,flexShrink:0},selector:{flex:1,minWidth:0,alignItems:'center'},stackedSelector:{flexBasis:'100%',minWidth:'100%',maxWidth:'100%'},
 trigger:{minHeight:44,maxWidth:'100%',paddingHorizontal:8,borderRadius:14,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},
 pro:{minWidth:64,minHeight:44,paddingHorizontal:10,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,borderWidth:1,borderRadius:14},
 menu:{position:'absolute',borderRadius:23,padding:14,borderWidth:1,shadowColor:'#403249',shadowOpacity:.086,shadowRadius:25,shadowOffset:{width:0,height:18},elevation:10},
 option:{minHeight:49,paddingHorizontal:10,borderRadius:14,flexDirection:'row',alignItems:'center',gap:9},
 add:{minHeight:48,paddingHorizontal:10,paddingTop:6,marginTop:12,borderTopWidth:1,flexDirection:'row',alignItems:'center',gap:9},
});
