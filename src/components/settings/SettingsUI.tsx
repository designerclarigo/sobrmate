import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, PressableProps, ScrollView, StyleSheet, Text as NativeText, TextInputProps, TextStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Info, X, type LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWindowDimensions } from 'react-native';
import { useTheme } from '../../design-system/theme';
import { TextProps } from '../../design-system/typography/Text';
import { resolveTextMetrics } from '../../design-system/typography/resolveTextMetrics';
import { NativeTextInput } from '../../design-system/components/NativeInput';
import { ScreenVisibilityContext } from '../ScreenVisibility';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { triggerHaptic } from '../../utils/haptics';

const light = { canvas:'#FAF9F6', surface:'#FFFFFF', ink:'#302B40', title:'#5E4D6C', secondary:'#7D6C88', muted:'#A08EA9', primary:'#6755A5', inverse:'#FFFFFF', icon:'#9276A7', soft:'#F4F0F7', border:'#E9E2EC', divider:'#F0EBF3', inputBorder:'#E4DAEB', kicker:'#7E698C', headerBorder:'#EAE4ED', headerIcon:'#79658D', notice:'#F2EDF6', noticeBorder:'#E7DFED', noticeInk:'#7B6789', noticeTitle:'#655173', secondaryButton:'#EFE9F4', secondaryInk:'#735D85', switchOff:'#E5DDEB', switchOn:'#9B80B3', gold:'#876A3F', goldBorder:'#E7DDC8', goldSoft:'#F9F4E9', goldEnd:'#F1E9D8', danger:'#A76676', dangerSoft:'#FAF3F3', dangerBorder:'#EBDDDF', success:'#6A805D', successSoft:'#F0F5EC', successBorder:'#D7E1D0', overlay:'#302B404A', widget:'#F3EDF8', widgetEnd:'#E9DEF2', widgetInk:'#806391', widgetBorder:'#DCD0E7',hero:'#F7F3FC',heroEnd:'#EBE3F3',heroBorder:'#E5DCEC',heroInk:'#9478AA',panelBorder:'#E8E1EB',rowChevron:'#9884A7',rowValue:'#8A739C',fieldLabel:'#796488',inputInk:'#5B4B69',copyTitle:'#5F4E6D',toggleTitle:'#695474',linkInk:'#7A608D',linkBorder:'#E6DDED',linkSurface:'#F6F2FA',segment:'#EDE7F0',segmentInk:'#6E5681',segmentMuted:'#8B739B',widgetCaption:'#9D83AD' };
export const SettingsOperationContext=React.createContext<(delta:number)=>void>(()=>{});
export const SettingsBusyContext=React.createContext(false);
const SettingsMotionContext=React.createContext(false);
export function SettingsMotionProvider({children}:{children:React.ReactNode}) {
  const reduced=useReducedMotion();
  return <SettingsMotionContext.Provider value={reduced}>{children}</SettingsMotionContext.Provider>;
}
export function useSettingsPalette(): typeof light {
  const { isDark, colors:c } = useTheme();
  return isDark ? { ...light, canvas:c.background.canvas,surface:c.background.surface,ink:c.text.primary,title:c.text.primary,secondary:c.text.secondary,muted:c.text.muted,primary:c.accent.primary,inverse:c.text.inverse,icon:c.text.accent,soft:c.accent.primaryLight,border:c.border.subtle,divider:c.border.subtle,inputBorder:c.border.medium,kicker:c.text.tertiary,headerBorder:c.border.subtle,headerIcon:c.text.accent,notice:c.accent.primaryLight,noticeBorder:c.accent.primaryBorder,noticeInk:c.text.secondary,noticeTitle:c.text.primary,secondaryButton:c.background.muted,secondaryInk:c.text.accent,switchOff:c.background.muted,switchOn:c.accent.primary,gold:c.accent.champagne,goldBorder:c.accent.amberBorder,goldSoft:c.accent.amberLight,goldEnd:c.background.subtle,danger:c.accent.rose,dangerSoft:c.accent.roseLight,dangerBorder:c.accent.roseBorder,success:c.text.success,successSoft:c.accent.successLight,successBorder:c.accent.successBorder,overlay:c.background.overlay,widget:c.accent.primaryLight,widgetEnd:c.background.subtle,widgetInk:c.text.accent,widgetBorder:c.accent.primaryBorder,hero:c.accent.primaryLight,heroEnd:c.background.subtle,heroBorder:c.accent.primaryBorder,heroInk:c.text.accent,panelBorder:c.border.subtle,rowChevron:c.text.tertiary,rowValue:c.text.tertiary,fieldLabel:c.text.secondary,inputInk:c.text.primary,copyTitle:c.text.primary,toggleTitle:c.text.primary,linkInk:c.text.accent,linkBorder:c.border.subtle,linkSurface:c.accent.primaryLight,segment:c.background.muted,segmentInk:c.text.accent,segmentMuted:c.text.secondary,widgetCaption:c.text.tertiary } : light;
}
export function SettingsText({ style, serif, weight='400', align, children, ...props }: TextProps) {
  const p=useSettingsPalette();
  const requested=StyleSheet.flatten([{fontSize:12,lineHeight:19.2,color:p.secondary},style]) as TextStyle;
  const metrics=resolveTextMetrics(requested,serif,weight);
  return <NativeText {...props} style={[{includeFontPadding:false,letterSpacing:0},requested,metrics,{fontSize:requested.fontSize,lineHeight:requested.lineHeight},serif&&{fontFamily:Platform.OS==='android'?'serif':'Georgia',fontWeight:'normal'},align&&{textAlign:align}]}>{children}</NativeText>;
}
export function SettingsPressable({style,disabled,onPress,onPressIn,onPressOut,...props}:PressableProps) {
  const reduced=useContext(SettingsMotionContext),pending=useContext(SettingsBusyContext),scale=useRef(new Animated.Value(1)).current,unavailable=disabled||pending;
  useEffect(()=>{if(reduced){scale.stopAnimation();scale.setValue(1);}return()=>scale.stopAnimation();},[reduced,scale]);
  const move=(value:number)=>{scale.stopAnimation();if(reduced)scale.setValue(1);else Animated.timing(scale,{toValue:value,duration:180,easing:Easing.bezier(.22,1,.36,1),useNativeDriver:true,isInteraction:false}).start();};
  return <Animated.View style={{transform:[{scale}]}}><Pressable {...props} disabled={unavailable} accessibilityState={{...props.accessibilityState,disabled:unavailable}} onPress={onPress} onPressIn={e=>{move(.985);onPressIn?.(e);}} onPressOut={e=>{move(1);onPressOut?.(e);}} style={state=>[typeof style==='function'?style(state):style,{opacity:unavailable?.45:1}]}/></Animated.View>;
}
export function SettingsButton({label,onPress,variant='primary',disabled=false,icon}:{label:string;onPress:()=>void|Promise<unknown>;variant?:'primary'|'secondary'|'danger';disabled?:boolean;icon?:React.ReactNode}) {
  const p=useSettingsPalette(),[busy,setBusy]=useState(false),[error,setError]=useState(''),flight=useRef(false);
  const operation=useContext(SettingsOperationContext),pending=useContext(SettingsBusyContext);
  const activate=async()=>{if(disabled||pending||flight.current)return;flight.current=true;operation(1);setBusy(true);setError('');triggerHaptic('light');try{await onPress();}catch(e){setError(e instanceof Error?e.message:'Unable to complete this action. Please try again.');}finally{flight.current=false;setBusy(false);operation(-1);}};
  const ink=variant==='secondary'?p.secondaryInk:p.inverse;
  return <View><SettingsPressable disabled={disabled||busy} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled:disabled||busy,busy}} onPress={()=>void activate()} style={{minHeight:48,paddingHorizontal:16,paddingVertical:12,borderRadius:14,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,backgroundColor:variant==='secondary'?p.secondaryButton:variant==='danger'?p.danger:p.primary}}>
    {busy?<ActivityIndicator color={ink} size="small"/>:icon}<SettingsText weight="500" align="center" style={{fontSize:12,lineHeight:18,color:ink,flexShrink:1}}>{label}</SettingsText>
  </SettingsPressable>{!!error&&<SettingsNotice error>{error}</SettingsNotice>}</View>;
}
export function SettingsCard({children,padded=false}:{children:React.ReactNode;padded?:boolean}) {const p=useSettingsPalette();return <View style={{backgroundColor:p.surface,borderWidth:1,borderColor:p.border,borderRadius:21,overflow:'hidden',...(padded?{padding:20}:{})}}>{children}</View>;}
export function SettingsGroup({title,children}:{title:string;children:React.ReactNode}) {const p=useSettingsPalette();return <View style={{gap:10}}><SettingsText weight="600" style={{fontSize:9,lineHeight:14.4,letterSpacing:1.4,color:p.kicker,marginHorizontal:4}}>{title.toUpperCase()}</SettingsText><SettingsCard>{children}</SettingsCard></View>;}
export function SettingsRow({title,detail,value,icon:Icon,onPress,first=false}:{title:string;detail?:string;value?:string;icon:LucideIcon;onPress:()=>void;first?:boolean}) {
  const p=useSettingsPalette();return <SettingsPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={[title,detail,value].filter(Boolean).join(', ')} style={{minHeight:68,paddingVertical:13,paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:11,borderTopWidth:first?0:1,borderColor:p.divider}}>
    <View style={{width:34,height:36,borderRadius:12,backgroundColor:p.soft,alignItems:'center',justifyContent:'center'}}><Icon size={19} strokeWidth={1.65} color={p.icon}/></View><View style={{flex:1,minWidth:0}}><SettingsText weight="500" style={{fontSize:13,lineHeight:19.5,color:p.title}}>{title}</SettingsText>{!!detail&&<SettingsText style={{fontSize:11,lineHeight:16.5,marginTop:3}}>{detail}</SettingsText>}</View>
    {!!value&&<SettingsText style={{fontSize:10,lineHeight:16,maxWidth:70,color:p.rowValue}}>{value}</SettingsText>}<ChevronRight size={16} strokeWidth={1.6} color={p.rowChevron}/>
  </SettingsPressable>;
}
export function SettingsHero({icon:Icon,title,description,eyebrow,hideIcon=false}:{icon:LucideIcon;title:string;description?:string;eyebrow?:string;hideIcon?:boolean}) {
  const p=useSettingsPalette();return <View style={{alignItems:'center',paddingTop:6,paddingBottom:4}}>
    {!hideIcon&&<LinearGradient colors={[p.hero,p.heroEnd]} start={{x:0,y:0}} end={{x:1,y:1}} style={{width:66,height:66,borderRadius:24,borderWidth:1,borderColor:p.heroBorder,alignItems:'center',justifyContent:'center',marginBottom:20}}><Icon size={27} strokeWidth={1.35} color={p.heroInk}/></LinearGradient>}
    {!!eyebrow&&<SettingsText weight="600" style={{fontSize:9,lineHeight:14.4,letterSpacing:1.5,color:p.kicker,textTransform:'uppercase'}}>{eyebrow}</SettingsText>}
    <SettingsText serif align="center" accessibilityRole="header" style={{fontSize:27,lineHeight:32.4,letterSpacing:-.65,color:p.ink,marginTop:8,marginBottom:12}}>{title}</SettingsText>
    {!!description&&<SettingsText align="center" style={{fontSize:12,lineHeight:20.4,maxWidth:295}}>{description}</SettingsText>}
  </View>;
}
export function SettingsNotice({children,title,error=false,success=false,icon:Icon=Info}:{children:React.ReactNode;title?:string;error?:boolean;success?:boolean;icon?:LucideIcon}) {
  const p=useSettingsPalette(),ink=error?p.danger:success?p.success:p.noticeInk;
  return <View accessibilityRole={error?'alert':undefined} accessibilityLiveRegion="polite" style={{padding:16,borderWidth:1,borderColor:error?p.dangerBorder:success?p.successBorder:p.noticeBorder,backgroundColor:error?p.dangerSoft:success?p.successSoft:p.notice,borderRadius:18,flexDirection:'row',alignItems:'flex-start',gap:11}}><Icon size={18} strokeWidth={1.65} color={ink} style={{marginTop:2}}/><View style={{flex:1}}>{!!title&&<SettingsText weight="500" style={{fontSize:12,lineHeight:19.2,color:error||success?ink:p.noticeTitle,marginBottom:3}}>{title}</SettingsText>}<SettingsText style={{fontSize:11,lineHeight:19.25,color:ink}}>{children}</SettingsText></View></View>;
}
export function SettingsCopy({sections}:{sections:{title:string;text:string}[]}) {const p=useSettingsPalette();return <SettingsCard padded>{sections.map((s,i)=><View key={s.title} style={{marginTop:i?24:0}}><SettingsText weight="500" accessibilityRole="header" style={{fontSize:13,lineHeight:20.8,color:p.copyTitle,marginBottom:9}}>{s.title}</SettingsText><SettingsText style={{fontSize:12,lineHeight:22.2}}>{s.text}</SettingsText></View>)}</SettingsCard>;}
export function SettingsLink({label,icon:Icon,onPress}:{label:string;icon:LucideIcon;onPress:()=>void}) {const p=useSettingsPalette();return <SettingsPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{minHeight:52,paddingVertical:12,paddingHorizontal:14,borderWidth:1,borderColor:p.linkBorder,borderRadius:15,backgroundColor:p.linkSurface,flexDirection:'row',alignItems:'center',gap:10}}><Icon size={18} strokeWidth={1.65} color={p.linkInk}/><SettingsText style={{flex:1,color:p.linkInk}}>{label}</SettingsText><ChevronRight size={16} color={p.icon}/></SettingsPressable>;}
export function SettingsToggle({label,description,value,onChange,disabled=false}:{label:string;description?:string;value:boolean;onChange:(value:boolean)=>Promise<unknown>|void;disabled?:boolean}) {
  const p=useSettingsPalette(),reduced=useContext(SettingsMotionContext),position=useRef(new Animated.Value(value?22:0)).current,flight=useRef(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{const a=Animated.timing(position,{toValue:value?22:0,duration:reduced?0:220,easing:Easing.bezier(.22,1,.36,1),useNativeDriver:true,isInteraction:false});a.start();return()=>a.stop();},[value,reduced,position]);
  const operation=useContext(SettingsOperationContext),pending=useContext(SettingsBusyContext);
  const toggle=async()=>{if(disabled||pending||flight.current)return;flight.current=true;operation(1);setBusy(true);setError('');triggerHaptic('selection');try{await onChange(!value);}catch(e){setError(e instanceof Error?e.message:'Could not save your preference.');}finally{flight.current=false;setBusy(false);operation(-1);}};
  return <View><View style={{padding:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:14}}><View style={{flex:1}}><SettingsText weight="500" style={{color:p.toggleTitle,fontSize:12,lineHeight:19.2}}>{label}</SettingsText>{!!description&&<SettingsText style={{fontSize:11,lineHeight:18.15,marginTop:5}}>{description}</SettingsText>}</View><Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{checked:value,disabled:disabled||busy||pending,busy:busy||pending}} disabled={disabled||busy||pending} onPress={()=>void toggle()} style={{width:48,height:44,opacity:disabled||pending?.45:1,justifyContent:'center'}}><View style={{height:26,borderRadius:20,backgroundColor:value?p.switchOn:p.switchOff}}/><Animated.View style={{position:'absolute',top:12,left:3,height:20,width:20,borderRadius:10,backgroundColor:'#FFFFFF',transform:[{translateX:position}],shadowColor:'#302B40',shadowOpacity:.12,shadowRadius:2,shadowOffset:{width:0,height:1},elevation:1}}/></Pressable></View>{!!error&&<View style={{margin:12,marginTop:0}}><SettingsNotice error>{error}</SettingsNotice></View>}</View>;
}
export function SettingsField({label,hint,style,...props}:TextInputProps&{label?:string;hint?:string}) {
  const p=useSettingsPalette(),pending=useContext(SettingsBusyContext),[focused,setFocused]=useState(false);return <View>{!!label&&<SettingsText weight="500" style={{fontSize:11,lineHeight:17.6,color:p.fieldLabel,marginBottom:8}}>{label}</SettingsText>}<NativeTextInput {...props} editable={props.editable!==false&&!pending} accessibilityState={{...props.accessibilityState,disabled:props.editable===false||pending}} accessibilityLabel={props.accessibilityLabel??label} onFocus={e=>{setFocused(true);props.onFocus?.(e);}} onBlur={e=>{setFocused(false);props.onBlur?.(e);}} placeholderTextColor={p.muted} style={[{minHeight:48,borderWidth:1,borderColor:focused?p.icon:p.inputBorder,borderRadius:13,paddingHorizontal:14,paddingVertical:12,fontSize:13,lineHeight:21,color:p.inputInk,backgroundColor:p.surface,textAlignVertical:props.multiline?'top':'center'},style]}/>{!!hint&&<SettingsText style={{fontSize:11,lineHeight:19.25,marginTop:8}}>{hint}</SettingsText>}</View>;
}
export function SettingsSegments({options,value,onSelect}:{options:{key:string;label:string}[];value:string;onSelect:(value:string)=>void|Promise<void>}) {
  const p=useSettingsPalette(),operation=useContext(SettingsOperationContext),[busy,setBusy]=useState(false),[error,setError]=useState(''),flight=useRef(false);
  const select=async(key:string)=>{if(flight.current||key===value)return;flight.current=true;operation(1);setBusy(true);setError('');try{await onSelect(key);}catch(e){setError(e instanceof Error?e.message:'Could not save your selection.');}finally{flight.current=false;setBusy(false);operation(-1);}};
  return <View style={{gap:12}}><View style={{flexDirection:'row',gap:4,padding:4,borderRadius:15,backgroundColor:p.segment}}>{options.map(o=><View key={o.key} style={{flex:1}}><SettingsPressable disabled={busy} accessibilityRole="button" accessibilityLabel={o.label} accessibilityState={{selected:value===o.key,disabled:busy}} onPress={()=>void select(o.key)} style={{minHeight:44,padding:8,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:value===o.key?p.surface:'transparent'}}><SettingsText align="center" style={{color:value===o.key?p.segmentInk:p.segmentMuted}}>{o.label}</SettingsText></SettingsPressable></View>)}</View>{!!error&&<SettingsNotice error>{error}</SettingsNotice>}</View>;
}

export function SettingsPanel({page,title,onBack,onClose,children,hidden=false,busy=false,scrollRef}:{scrollRef?:React.RefObject<ScrollView|null>;page:string;title:string;onBack?:()=>void;onClose:()=>void;children:React.ReactNode;hidden?:boolean;busy?:boolean}) {
  const p=useSettingsPalette(),insets=useSafeAreaInsets(),dimensions=useWindowDimensions(),focused=useContext(ScreenVisibilityContext),reduced=useContext(SettingsMotionContext);
  const motion=useRef(new Animated.Value(0)).current,compact=dimensions.width<640;
  useEffect(()=>{motion.setValue(reduced?1:0);const a=Animated.timing(motion,{toValue:1,duration:250,easing:Easing.bezier(.22,1,.36,1),useNativeDriver:true,isInteraction:false});a.start();return()=>a.stop();},[page,reduced,motion]);
  return <Modal transparent visible={focused&&!hidden} statusBarTranslucent navigationBarTranslucent animationType={reduced?'none':'fade'} onRequestClose={()=>{if(!busy)(onBack??onClose)();}}>
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1,backgroundColor:p.overlay,padding:compact?0:20,alignItems:'center',justifyContent:'center'}}>
      <View accessibilityViewIsModal style={{width:'100%',maxWidth:compact?'100%':410,height:compact?'100%':Math.min(840,dimensions.height-40),backgroundColor:p.canvas,borderRadius:compact?0:30,overflow:'hidden',borderWidth:compact?0:1,borderColor:p.panelBorder}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:16,paddingBottom:12,paddingTop:compact?Math.max(12,insets.top):12,borderBottomWidth:1,borderColor:p.headerBorder}}>
          {onBack?<SettingsPressable disabled={busy} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to Settings" style={ui.headerButton}><ChevronLeft size={19} color={p.headerIcon} strokeWidth={1.65}/></SettingsPressable>:<View style={ui.headerButton}/>}
          <SettingsText accessibilityRole="header" weight="600" align="center" style={{fontSize:14,lineHeight:19.6,color:p.ink,flex:1}}>{title}</SettingsText><SettingsPressable disabled={busy} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close settings" style={ui.headerButton}><X size={19} color={p.headerIcon} strokeWidth={1.65}/></SettingsPressable>
        </View>
        <ScrollView ref={scrollRef} key={page} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" style={{flex:1}} contentContainerStyle={{paddingTop:24,paddingHorizontal:22,paddingBottom:Math.max(28,insets.bottom)}}><Animated.View style={{gap:20,opacity:motion,transform:[{translateY:motion.interpolate({inputRange:[0,1],outputRange:[7,0]})}]}}>{children}</Animated.View></ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
const ui=StyleSheet.create({headerButton:{width:44,height:44,borderRadius:14,alignItems:'center',justifyContent:'center'}});
