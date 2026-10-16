import React,{useContext,useEffect,useRef,useState} from 'react';
import {Animated,Easing,KeyboardAvoidingView,Modal,Platform,Pressable,ScrollView,StyleSheet,StyleProp,View,ViewStyle,useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../design-system/theme';
import {useReducedMotion} from '../../utils/useReducedMotion';
import {ScreenVisibilityContext} from '../ScreenVisibility';

/** Calendar-only native surface; shared sheets outside this tab keep their existing layout. */
export function CalendarPanel({visible,onClose,children,footer,header,style,presentation='bottom',handle=true}: {
 visible:boolean;onClose:()=>void;children:React.ReactNode;footer?:React.ReactNode;header?:React.ReactNode;
 style?:StyleProp<ViewStyle>;presentation?:'bottom'|'center';handle?:boolean;
}) {
 const {colors}=useTheme();const insets=useSafeAreaInsets();const {width,height}=useWindowDimensions();
 const screenVisible=useContext(ScreenVisibilityContext);const reduced=useReducedMotion();const motion=useRef(new Animated.Value(0)).current;
 const [mounted,setMounted]=useState(visible);
 const center=presentation==='center'||width>=640;
 useEffect(()=>{let canceled=false;motion.stopAnimation();if(reduced){setMounted(visible);motion.setValue(visible?1:0);return;}
  if(visible){setMounted(true);motion.setValue(0);}
  Animated.timing(motion,{toValue:visible?1:0,duration:visible?240:180,easing:Easing.bezier(.2,.7,.2,1),useNativeDriver:true,isInteraction:false})
   .start(({finished})=>{if(finished&&!canceled&&!visible)setMounted(false);});
  return()=>{canceled=true;motion.stopAnimation();};},[visible,reduced,motion]);
 return <Modal visible={mounted&&screenVisible} transparent animationType="none" onRequestClose={onClose}>
  <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={[styles.overlay,{justifyContent:center?'center':'flex-end',paddingHorizontal:center?16:0,paddingTop:insets.top}]}>
   <Animated.View style={[styles.backdrop,{backgroundColor:colors.background.overlay,opacity:motion}]}><Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close calendar dialog" accessibilityRole="button"/></Animated.View>
   <Animated.View accessibilityViewIsModal pointerEvents={visible?'auto':'none'} accessibilityElementsHidden={!visible} importantForAccessibility={visible?'auto':'no-hide-descendants'} style={[styles.panel,{maxHeight:height-insets.top-24,backgroundColor:colors.background.canvas,borderColor:colors.border.subtle,
    borderBottomLeftRadius:center?28:0,borderBottomRightRadius:center?28:0,opacity:motion,transform:[{translateY:motion.interpolate({inputRange:[0,1],outputRange:[center?8:24,0]})}]},style]}>
    {handle&&<View style={styles.handleWrap}><View style={[styles.handle,{backgroundColor:colors.border.medium}]}/></View>}
    {header&&<View style={[styles.header,{borderColor:colors.background.muted}]}>{header}</View>}
    <ScrollView style={{flexShrink:1}} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
    {footer&&<View style={[styles.footer,{borderColor:colors.background.muted,paddingBottom:Math.max(14,insets.bottom)}]}>{footer}</View>}
   </Animated.View>
  </KeyboardAvoidingView>
 </Modal>;
}
const styles=StyleSheet.create({
 overlay:{flex:1},backdrop:{position:'absolute',top:0,left:0,right:0,bottom:0},
 panel:{width:'100%',maxWidth:400,alignSelf:'center',flexShrink:1,borderWidth:1,borderTopLeftRadius:28,borderTopRightRadius:28,overflow:'hidden',shadowColor:'#302B40',shadowOpacity:.12,shadowRadius:24,shadowOffset:{width:0,height:12},elevation:8},
 handleWrap:{alignItems:'center',paddingTop:12,paddingBottom:4},handle:{width:40,height:4,borderRadius:2},
 header:{paddingHorizontal:20,paddingTop:4,paddingBottom:12,borderBottomWidth:1},
 body:{padding:20},footer:{paddingHorizontal:20,paddingTop:14,borderTopWidth:1},
});
