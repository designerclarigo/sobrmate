import React,{useEffect,useRef,useState} from 'react';
import {Animated,Easing,Pressable,View} from 'react-native';
import {Check,ChevronLeft,ChevronRight,Heart,LockKeyhole} from 'lucide-react-native';
import {Text,Button} from '../../design-system';
import {useTheme} from '../../design-system/theme';
import {RecoveryPersonalization,recoveryQuestions} from '../../data/personalization';
import {useReducedMotion} from '../../utils/useReducedMotion';
import {triggerHaptic} from '../../utils/haptics';

export function RecoveryQuestionnaire({value,onChange,disabled=false,stepLabel='STEP 7 · YOUR DAILY RHYTHM',initialQuestion=0,onQuestionChange}:{value:RecoveryPersonalization;onChange:(value:RecoveryPersonalization)=>void;disabled?:boolean;stepLabel?:string;initialQuestion?:number;onQuestionChange?:(question:number)=>void}) {
  const {colors:c}=useTheme(),reduced=useReducedMotion(),[question,setQuestion]=useState(initialQuestion),motion=useRef(new Animated.Value(1)).current;
  const showQuestion=(next:number)=>{setQuestion(next);onQuestionChange?.(next);};
  const current=recoveryQuestions[question],answer=value[current.key];
  const completed=recoveryQuestions.filter(q=>{const a=value[q.key];return Array.isArray(a)?a.length>0:!!a;}).length;
  useEffect(()=>{motion.setValue(reduced?1:0);const animation=Animated.timing(motion,{toValue:1,duration:220,easing:Easing.out(Easing.cubic),useNativeDriver:true,isInteraction:false});animation.start();return()=>animation.stop();},[question,reduced,motion]);
  const choose=(option:string)=>{if(disabled)return;triggerHaptic('selection');if(current.multiple){const previous=value[current.key] as string[];onChange({...value,[current.key]:previous.includes(option)?previous.filter(v=>v!==option):[...previous,option]});}else onChange({...value,[current.key]:answer===option?'':option});};
  return <View style={{gap:20}}>
    <Text variant="subcaption" color="accent" weight="500" style={{letterSpacing:1.1}}>{stepLabel}</Text>
    <View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={{width:48,height:48,borderRadius:17,backgroundColor:c.accent.primaryLight,alignItems:'center',justifyContent:'center'}}><Heart size={23} strokeWidth={1.5} color={c.accent.primary}/></View><View style={{flex:1}}><Text variant="title2" serif>A little more you.</Text><Text variant="caption" color="secondary">Optional · {completed} of 4 answered</Text></View></View>
    <View style={{flexDirection:'row',gap:8}}>{recoveryQuestions.map((q,i)=><Pressable key={q.key} disabled={disabled} accessibilityRole="button" accessibilityLabel={`Question ${i+1}: ${q.title}`} accessibilityState={{selected:question===i,disabled}} onPress={()=>showQuestion(i)} style={{flex:1,minHeight:44,justifyContent:'center'}}><View style={{height:4,borderRadius:4,backgroundColor:i===question?c.accent.primary:c.border.subtle}}/></Pressable>)}</View>
    <Animated.View key={current.key} style={{gap:16,opacity:motion,transform:[{translateY:motion.interpolate({inputRange:[0,1],outputRange:[6,0]})}]}}>
      <Text variant="title2" serif accessibilityRole="header">{current.title}</Text><Text color="secondary">{current.subtitle}</Text>
      {current.options.map(option=>{const selected=Array.isArray(answer)?answer.includes(option):answer===option;return <Pressable key={option} disabled={disabled} onPress={()=>choose(option)} accessibilityRole={current.multiple?'checkbox':'radio'} accessibilityState={{checked:selected,selected,disabled}} accessibilityLabel={option} style={({pressed})=>({minHeight:64,padding:18,borderRadius:20,borderWidth:1,borderColor:selected?c.accent.primary:c.border.subtle,backgroundColor:selected?c.accent.primaryLight:c.background.surface,flexDirection:'row',alignItems:'center',gap:14,opacity:pressed?.75:1})}><View style={{height:22,width:22,borderRadius:current.multiple?7:11,borderWidth:1,borderColor:selected?c.accent.primary:c.border.medium,backgroundColor:selected?c.accent.primary:'transparent',alignItems:'center',justifyContent:'center'}}>{selected&&<Check size={14} color={c.text.inverse}/>}</View><Text style={{flex:1}} weight={selected?'500':'400'}>{option}</Text></Pressable>;})}
    </Animated.View>
    <View style={{flexDirection:'row',gap:12}}><View style={{flex:1}}><Button label="Previous question" variant="ghost" disabled={disabled||question===0} iconLeft={<ChevronLeft size={16} color={c.accent.primary}/>} onPress={()=>setQuestion(question-1)}/></View><View style={{flex:1}}><Button label={question===3?'First question':'Next question'} variant="outline" disabled={disabled} iconRight={<ChevronRight size={16} color={c.accent.primary}/>} onPress={()=>setQuestion(question===3?0:question+1)}/></View></View>
    <View style={{flexDirection:'row',gap:8,alignItems:'flex-start'}}><LockKeyhole size={15} color={c.text.tertiary} style={{marginTop:3}}/><Text variant="caption" color="secondary" style={{flex:1}}>Answers stay on this device and help personalize your daily encouragement. You can leave any question unanswered.</Text></View>
  </View>;
}
