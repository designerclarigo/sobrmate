import React,{createContext,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {ActivityIndicator,Animated,Easing,Platform,Pressable,StyleSheet,Text as NativeText,TextStyle,View} from 'react-native';
import {ThemeScope,useTheme} from '../../design-system/theme';
import {colors,ColorTokens} from '../../design-system/tokens/colors';
import {TextProps} from '../../design-system/typography/Text';
import {typography} from '../../design-system/tokens/typography';
import {resolveTextMetrics} from '../../design-system/typography/resolveTextMetrics';
import {ButtonProps} from '../../design-system/components/Button';
import {useReducedMotion} from '../../utils/useReducedMotion';
import {triggerHaptic} from '../../utils/haptics';

const MilestoneMotionContext=createContext(false);
export const useMilestoneReducedMotion=()=>useContext(MilestoneMotionContext);

const milestoneColors:ColorTokens={...colors,
 background:{...colors.background,subtle:'#F3EFF7',muted:'#EFEAED',overlay:'#302B4050'},
 text:{...colors.text,primary:'#302B40',secondary:'#7C6F85',tertiary:'#7B6B87',muted:'#B9A8C7',accent:'#675280'},
 accent:{...colors.accent,primary:'#6755A5',primaryHover:'#594891',primaryDark:'#675280',primaryLight:'#F0EAF6',primaryBorder:'#DDD0E8',
  amber:'#977749',champagne:'#977749',champagneLight:'#F5F0E5',amberLight:'#F5F0E5',amberBorder:'#EADFC9'},
 border:{subtle:'#E8E2EB',medium:'#E6DEEB',focus:'#BAA8D7',selected:'#D8C9E5'},
};
export const milestoneLight={
 canvas:'#FAF9F6',surface:'#FFFFFF',ink:'#302B40',title:'#675280',heading:'#5F4D70',secondary:'#7C6F85',caption:'#7B6B87',kicker:'#786783',muted:'#B9A8C7',
 primary:'#6755A5',inverse:'#FFFFFF',soft:'#F0EAF6',border:'#E8E2EB',sheetBorder:'#E6DEEB',focus:'#BAA8D7',
 headerBorder:'#EEE8EF',headerSelector:'#937BA4',headerGold:'#806338',headerGoldSurface:'#F4EEDFAA',headerGoldBorder:'#E8DDC7',
 menuBorder:'#E6DEED',menuKicker:'#A08CB0',menuInk:'#8C729F',menuAdd:'#8D72A3',menuDivider:'#F0EAF3',
 shareBorder:'#E6DDED',shareHeaderBorder:'#EAE3ED',shareFooterBorder:'#EBE3EF',shareOverlay:'#302B404A',shareHeading:'#655174',shareKicker:'#857092',shareControl:'#776084',shareCaption:'#8B7699',shareHint:'#8B7897',shareBack:'#7A638B',
 streakText:'#75617E',streakBorder:'#E8DFEE',streakSurface:'#F2EDF6',
 feature:['#FFFFFF','#F8F4FC'] as const,featureBorder:'#E2D8EA',featureTitle:'#665079',featureCaption:'#806B8E',featureIcon:['#F6F0FD','#E9DEF3'] as const,
 featureIconBorder:'#DDCFE8',featureIconInset:'#F7F3FB',featureIconInk:'#9270A9',
 targetSurface:'#F0E9F6',targetBorder:'#E3D8EB',targetText:'#877097',progressTrack:'#EDE5F3',progress:['#B99DD0','#9273AB'] as const,progressValue:'#8A6E9E',divider:'#EEE7F3',
 filterSurface:'#EFEAED',filterBorder:'#E8E1E9',filterText:'#7E6D89',countSurface:'#F3EFF7',countInk:'#7A6789',
 rowInk:'#5E4F6B',nextBorder:'#D8C9E5',nextSurface:'#FCFAFF',emblemSurface:'#F3EFF7',emblemBorder:'#E8DEEF',emblemInk:'#9A80AE',
 gold:'#977749',goldSurface:'#F5F0E5',goldBorder:'#EADFC9',earnedInk:'#66755F',earnedIcon:'#A0834E',backInk:'#78648C',closeInk:'#7A6886',noteInk:'#7E6D88',
 detailBadge:['#F8F3E8','#ECE0C8'] as const,detailBadgeBorder:'#DFD0B3',detailBadgeInset:'#E8DDC8',
 lockedBadge:['#F3EEF8','#E6DCF0'] as const,lockedBorder:'#DDD0E8',lockedInset:'#E4DAED',lockedInk:'#987AAE',
 quote:['#FFFFFF','#FBF8FD'] as const,quoteBorder:'#E9E1EE',quoteInk:'#8E719F',detailsInk:'#655171',detailLabel:'#83718E',detailSubtitle:'#7C6A86',detailAction:'#EEE7F4',overlay:'#302B4050',handle:'#DAD1E1',
} as const;
export type MilestonePalette={ [K in keyof typeof milestoneLight]:typeof milestoneLight[K] extends readonly string[]?readonly [string,string]:string };
export function MilestoneAppearance({children}:{children:React.ReactNode}){
 const theme=useTheme(),reduced=useReducedMotion();return <ThemeScope colors={theme.isDark?theme.colors:milestoneColors}><MilestoneMotionContext.Provider value={reduced}>{children}</MilestoneMotionContext.Provider></ThemeScope>;
}
export function useMilestoneAppearance():MilestonePalette{
 const {colors,isDark}=useTheme();
 return useMemo(()=>isDark?{...milestoneLight,canvas:colors.background.canvas,surface:colors.background.surface,ink:colors.text.primary,title:colors.text.accent,heading:colors.text.primary,
  secondary:colors.text.secondary,caption:colors.text.tertiary,kicker:colors.text.tertiary,muted:colors.text.muted,primary:colors.accent.primary,inverse:colors.text.inverse,soft:colors.accent.primaryLight,border:colors.border.subtle,sheetBorder:colors.border.subtle,focus:colors.border.focus,
  headerBorder:colors.border.subtle,headerSelector:colors.text.tertiary,headerGold:colors.accent.champagne,headerGoldSurface:colors.accent.champagneLight,headerGoldBorder:colors.accent.amberBorder,
  menuBorder:colors.border.subtle,menuKicker:colors.text.tertiary,menuInk:colors.text.secondary,menuAdd:colors.text.accent,menuDivider:colors.border.subtle,
  shareBorder:colors.border.subtle,shareHeaderBorder:colors.border.subtle,shareFooterBorder:colors.border.subtle,shareOverlay:colors.background.overlay,shareHeading:colors.text.primary,shareKicker:colors.text.tertiary,shareControl:colors.text.accent,shareCaption:colors.text.secondary,shareHint:colors.text.tertiary,shareBack:colors.text.accent,
  streakText:colors.text.accent,streakBorder:colors.accent.primaryBorder,streakSurface:colors.accent.primaryLight,
  feature:[colors.background.surface,colors.background.subtle],featureBorder:colors.accent.primaryBorder,featureTitle:colors.text.accent,featureCaption:colors.text.secondary,
  featureIcon:[colors.accent.primaryLight,colors.background.subtle],featureIconBorder:colors.accent.primaryBorder,featureIconInset:colors.background.canvas,featureIconInk:colors.text.accent,
  targetSurface:colors.accent.primaryLight,targetBorder:colors.accent.primaryBorder,targetText:colors.text.secondary,progressTrack:colors.background.muted,progress:[colors.accent.primary,colors.text.accent],progressValue:colors.text.accent,divider:colors.border.subtle,
  filterSurface:colors.background.muted,filterBorder:colors.border.subtle,filterText:colors.text.secondary,countSurface:colors.accent.primaryLight,countInk:colors.text.accent,
  rowInk:colors.text.primary,nextBorder:colors.accent.primaryBorder,nextSurface:colors.background.subtle,emblemSurface:colors.accent.primaryLight,emblemBorder:colors.accent.primaryBorder,emblemInk:colors.text.accent,
  gold:colors.accent.champagne,goldSurface:colors.accent.champagneLight,goldBorder:colors.accent.amberBorder,earnedInk:colors.text.success,earnedIcon:colors.accent.champagne,backInk:colors.text.tertiary,closeInk:colors.text.tertiary,noteInk:colors.text.tertiary,
  detailBadge:[colors.accent.champagneLight,colors.background.subtle],detailBadgeBorder:colors.accent.amberBorder,detailBadgeInset:colors.accent.amberBorder,
  lockedBadge:[colors.accent.primaryLight,colors.background.subtle],lockedBorder:colors.accent.primaryBorder,lockedInset:colors.accent.primaryBorder,lockedInk:colors.text.accent,
  quote:[colors.background.surface,colors.background.subtle],quoteBorder:colors.border.subtle,quoteInk:colors.text.secondary,detailsInk:colors.text.primary,detailLabel:colors.text.secondary,detailSubtitle:colors.text.secondary,detailAction:colors.accent.primaryLight,overlay:colors.background.overlay,handle:colors.border.medium,
 }:milestoneLight,[colors,isDark]);
}
export function MilestoneText({serif,variant='body',weight,style,tabular,align,color='primary',...props}:TextProps){
 const {colors}=useTheme();const requested=StyleSheet.flatten([typography[variant],style]) as TextStyle;
 const metrics=resolveTextMetrics(requested,serif===true,weight);
 // Match this tab's published 8–13px labels; shared text elsewhere retains its existing minimum.
 const fontSize=requested.fontSize??15,lineHeight=requested.lineHeight??fontSize*1.5;
 const map={...colors.text,amber:colors.accent.amber,rose:colors.accent.rose};
 return <NativeText {...props} style={[typography[variant],{includeFontPadding:false,color:map[color]},style,metrics,
  {fontSize,lineHeight,...(serif?{fontFamily:Platform.OS==='android'?'serif':'Georgia',fontWeight:'normal' as const}:{})},align&&{textAlign:align},tabular&&{fontVariant:['tabular-nums']}]}/>;
}
export function MilestoneButton(props:ButtonProps){
 const p=useMilestoneAppearance(),{colors}=useTheme(),reduced=useMilestoneReducedMotion();
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const flight=useRef(false),scale=useRef(new Animated.Value(1)).current;
 const {variant='primary',disabled=false,loading=false,label,onPress,iconLeft,iconRight,fullWidth,style,labelStyle,contentAlignment='center'}=props;
 const pending=busy||loading,unavailable=disabled||pending;
 const ink=variant==='primary'?p.inverse:variant==='danger'?colors.accent.rose:variant==='success'?colors.text.success:p.title;
 const background=variant==='primary'?p.primary:variant==='secondary'?p.detailAction:variant==='outline'?p.surface:'transparent';
 useEffect(()=>{if(reduced){scale.stopAnimation();scale.setValue(1);}return()=>scale.stopAnimation();},[reduced,scale]);
 const pressFeedback=(value:number)=>{scale.stopAnimation();if(reduced){scale.setValue(1);return;}Animated.timing(scale,{toValue:value,duration:200,easing:Easing.bezier(.22,1,.36,1),useNativeDriver:true,isInteraction:false}).start();};
 const activate=async()=>{
  if(unavailable||flight.current)return;flight.current=true;setError('');triggerHaptic(variant==='primary'?'medium':'light');
  try{const result=onPress?.();if(result instanceof Promise){setBusy(true);await result;}}
  catch(e){setError(e instanceof Error?e.message:'Unable to complete this action. Please try again.');}
  finally{flight.current=false;setBusy(false);}
 };
 return <View style={fullWidth?{width:'100%'}:undefined}><Animated.View style={{transform:[{scale}]}}>
  <Pressable onPress={()=>{void activate();}} onPressIn={()=>pressFeedback(.975)} onPressOut={()=>pressFeedback(1)} disabled={unavailable} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled:unavailable,busy:pending}}
   style={[{minHeight:48,borderRadius:14,paddingHorizontal:8,paddingVertical:10,flexDirection:'row',alignItems:'center',justifyContent:contentAlignment==='space-between'?'space-between':'center',gap:7,backgroundColor:background,borderWidth:variant==='outline'?1:0,borderColor:p.border,opacity:unavailable?0.65:1},fullWidth&&{width:'100%'},style]}>
   {pending?<ActivityIndicator size="small" color={ink}/>:iconLeft}
   <MilestoneText weight="500" align="center" style={[{fontSize:12,lineHeight:18,color:ink,flexShrink:1},labelStyle]}>{label}</MilestoneText>
   {!pending&&iconRight}
  </Pressable>
 </Animated.View>{!!error&&<MilestoneText color="rose" accessibilityRole="alert" style={{fontSize:12,lineHeight:18,marginTop:8}}>{error}</MilestoneText>}</View>;
}
