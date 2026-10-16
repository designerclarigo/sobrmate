import React,{useContext,useEffect,useMemo,useRef,useState} from 'react';
import {Animated,Easing,Modal,Pressable,ScrollView,StyleSheet,View,useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {X} from 'lucide-react-native';
import {ScreenVisibilityContext} from '../ScreenVisibility';
import {useMilestoneAppearance,useMilestoneReducedMotion as useReducedMotion} from './milestoneAppearance';
import {MilestonePressable} from './MilestoneMotion';

export function MilestonePanel({visible,onClose,children,closeDisabled=false,center=false,sharing=false,header,footer}:{visible:boolean;onClose:()=>void;children:React.ReactNode;closeDisabled?:boolean;center?:boolean;sharing?:boolean;header?:React.ReactNode;footer?:React.ReactNode}){
 const p=useMilestoneAppearance(),reduced=useReducedMotion(),insets=useSafeAreaInsets(),dimensions=useWindowDimensions();const focused=useContext(ScreenVisibilityContext);
 const [mounted,setMounted]=useState(visible),motion=useRef(new Animated.Value(0)).current;
 const translateY=useMemo(()=>motion.interpolate({inputRange:[0,1],outputRange:[16,0]}),[motion]);
 useEffect(()=>{let canceled=false;motion.stopAnimation();if(reduced){setMounted(visible);motion.setValue(visible?1:0);return;}
  if(visible){setMounted(true);motion.setValue(0);}const animation=Animated.timing(motion,{toValue:visible?1:0,duration:visible?320:180,easing:Easing.bezier(.22,1,.36,1),useNativeDriver:true,isInteraction:false});
  animation.start(({finished})=>{if(finished&&!canceled&&!visible)setMounted(false);});return()=>{canceled=true;animation.stop();};
 },[visible,reduced,motion]);
 const compact=dimensions.width<640,centered=sharing?true:center;
 // Keep Android window flags stable while the same host transitions from details to sharing.
 return <Modal visible={mounted&&focused} transparent statusBarTranslucent navigationBarTranslucent animationType="none" onRequestClose={()=>{if(!closeDisabled)onClose();}}>
  <View style={[styles.overlay,{paddingTop:sharing?0:insets.top,paddingHorizontal:sharing?(compact?0:20):centered?16:0,justifyContent:centered?'center':'flex-end'}]}>
   <Animated.View style={[styles.backdrop,{opacity:motion,backgroundColor:sharing?p.shareOverlay:p.overlay}]}><Pressable disabled={closeDisabled} style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss milestone details"/></Animated.View>
   <Animated.View accessibilityViewIsModal accessibilityElementsHidden={!visible} importantForAccessibility={visible?'auto':'no-hide-descendants'} pointerEvents={visible?'auto':'none'} style={[styles.panel,{maxHeight:Math.min(dimensions.height*.85,dimensions.height-insets.top-16),backgroundColor:p.canvas,borderColor:p.sheetBorder,
    borderBottomLeftRadius:centered?28:0,borderBottomRightRadius:centered?28:0,opacity:motion,transform:[{translateY}]},sharing&&{maxWidth:compact?'100%':410,height:compact?dimensions.height:Math.min(840,dimensions.height-40),maxHeight:dimensions.height,borderWidth:compact?0:1,borderColor:p.shareBorder,borderTopLeftRadius:compact?0:30,borderTopRightRadius:compact?0:30,borderBottomLeftRadius:compact?0:30,borderBottomRightRadius:compact?0:30}]}>
    {sharing&&<View style={{paddingHorizontal:16,paddingTop:compact?Math.max(12,insets.top):12,paddingBottom:12,borderBottomWidth:1,borderColor:p.shareHeaderBorder}}>{header}</View>}
    <ScrollView key={sharing?'sharing':center?'certificate':'details'} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={sharing&&!compact} style={{flexShrink:1,...(sharing?{flex:1}:{})}} contentContainerStyle={sharing?{paddingHorizontal:22,paddingTop:dimensions.height<=760?16:19,paddingBottom:20}:{paddingHorizontal:24,paddingBottom:Math.max(24,insets.bottom)}}>
     {!sharing&&<><View style={styles.handleWrap}><View style={[styles.handle,{backgroundColor:p.handle}]}/></View><MilestonePressable disabled={closeDisabled} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close milestone inspection" style={[styles.close,{backgroundColor:p.soft}]}><X size={17} strokeWidth={1.6} color={p.closeInk}/></MilestonePressable></>}
     {children}
    </ScrollView>
    {sharing&&footer&&<View style={{paddingHorizontal:22,paddingTop:dimensions.height<=760?10:12,paddingBottom:Math.max(16,insets.bottom),borderTopWidth:1,borderColor:p.shareFooterBorder}}>{footer}</View>}
   </Animated.View>
  </View>
 </Modal>;
}
const styles=StyleSheet.create({
 overlay:{flex:1},backdrop:{position:'absolute',top:0,left:0,right:0,bottom:0},panel:{width:'100%',maxWidth:400,alignSelf:'center',flexShrink:1,borderWidth:1,borderTopLeftRadius:28,borderTopRightRadius:28,overflow:'hidden',shadowColor:'#302B40',shadowOpacity:.06,shadowRadius:24,shadowOffset:{width:0,height:-12},elevation:8},
 handleWrap:{alignItems:'center',paddingTop:12},handle:{width:32,height:3,borderRadius:4},close:{position:'absolute',top:17,right:16,width:44,height:44,borderRadius:14,alignItems:'center',justifyContent:'center'},
});
