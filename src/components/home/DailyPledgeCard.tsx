import React,{useRef,useState,useEffect} from 'react';
import {View,Animated,StyleSheet} from 'react-native';
import {ArrowRight,Check,ShieldCheck} from 'lucide-react-native';
import {Text,Button,BottomSheet,useTheme} from '../../design-system';
import {Habit} from '../../data/types';
import {useRecoveryStore} from '../../data/store';
import {getLocalDateString} from '../../utils/date';
import {useReducedMotion} from '../../utils/useReducedMotion';
import {triggerHaptic} from '../../utils/haptics';
import { HomePressable } from './HomePressable';
import { HomePalette, HomeText, useHomeAppearance, useHomeStyles } from './homeAppearance';
export function DailyPledgeCard({activeHabit}:{activeHabit:Habit}){
 const {colors}=useTheme();const {pledges,pledgeToday,currentTime}=useRecoveryStore('day');const reduced=useReducedMotion();
 const palette=useHomeAppearance();const styles=useHomeStyles(makeStyles);
 const [visible,setVisible]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const flight=useRef(false);const scale=useRef(new Animated.Value(1)).current;
 const pledged=pledges.some(entry=>entry.habitId===activeHabit.id&&entry.date===getLocalDateString(currentTime));
 useEffect(()=>{if(pledged&&visible&&!reduced){scale.setValue(.8);Animated.spring(scale,{toValue:1,useNativeDriver:true,speed:16,bounciness:3}).start();}return()=>scale.stopAnimation();},[pledged,visible,reduced,scale]);
 const close=()=>{if(!flight.current)setVisible(false);};
 const commit=async()=>{if(pledged){close();return;}if(flight.current)return;flight.current=true;setBusy(true);setError('');try{await pledgeToday(activeHabit.id);triggerHaptic('medium');}catch(e){setError(e instanceof Error?e.message:'Could not save your pledge. Please try again.');}finally{flight.current=false;setBusy(false);}};
 return <>
  <HomePressable accessibilityLabel={pledged?'Your daily pledge, completed':'Open daily pledge'} onPress={()=>{setError('');setVisible(true);}}
    style={[styles.card,pledged&&styles.completedCard]}>
    <View style={[styles.icon,pledged&&styles.completedIcon]}>{pledged?<Check size={18} strokeWidth={1.7} color={palette.pledgeDoneText}/>:<ShieldCheck size={18} strokeWidth={1.6} color={palette.pledgeArrow}/>}</View>
    <View style={styles.copy}><HomeText weight="600" style={[styles.label,pledged&&styles.completedText]}>{pledged?'TODAY, YOU SHOWED UP':'YOUR DAILY PLEDGE'}</HomeText>
      <HomeText weight="500" style={[styles.message,pledged&&styles.completedText]}>{pledged?'One kind choice, kept.':'Make a little promise to yourself.'}</HomeText></View>
    <ArrowRight size={15} strokeWidth={1.6} color={pledged?palette.pledgeDoneText:palette.pledgeArrow}/>
  </HomePressable>
  <BottomSheet visible={visible} onClose={close} title={pledged?'Your intention is set.':'A moment for yourself.'} subtitle={activeHabit.title} footer={<Button label={pledged?'Return to my day':'I pledge for today'} loading={busy} onPress={()=>void commit()}/>}>
   <View style={{gap:24,paddingVertical:24,alignItems:'center'}}><Animated.View style={{transform:[{scale}],width:80,height:80,borderRadius:28,backgroundColor:pledged?colors.accent.successLight:colors.accent.primaryLight,alignItems:'center',justifyContent:'center'}}>{pledged?<Check size={36} color={colors.status.success}/>:<ShieldCheck size={36} color={colors.accent.primary}/>}</Animated.View>
     <Text serif variant="title2" align="center">“{activeHabit.pledge||'One day at a time. I make space for what matters.'}”</Text>
     <Text color="secondary" align="center">{pledged?'You have set your intention. Carry it gently through the day.':'Pause, take a breath, and return to your reason for beginning.'}</Text>
     {!!error&&<Text accessibilityRole="alert" color="rose">{error}</Text>}
   </View>
  </BottomSheet>
 </>;
}
const makeStyles=(p:HomePalette)=>StyleSheet.create({
 card:{backgroundColor:p.pledge,borderWidth:1,borderColor:p.pledgeBorder,borderRadius:20,padding:15,flexDirection:'row',alignItems:'center',gap:10},
 completedCard:{backgroundColor:p.pledgeDone,borderColor:p.pledgeDoneBorder},
 icon:{width:36,height:36,borderRadius:12,backgroundColor:p.pledgeIcon,alignItems:'center',justifyContent:'center'},
 completedIcon:{backgroundColor:p.pledgeDoneIcon},
 copy:{flex:1,minWidth:0,gap:4},label:{fontSize:12,lineHeight:17,letterSpacing:1.25,color:p.muted},
 message:{fontSize:12,lineHeight:18,color:p.pledgeText},completedText:{color:p.pledgeDoneText},
});
