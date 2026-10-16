import React,{useEffect,useRef,useState} from 'react';
import { View,TouchableOpacity,StyleSheet } from 'react-native';
import { Lock,Share2,Download } from 'lucide-react-native';
import { Text,Button,BottomSheet,Toggle,colors,useTheme,useThemedStyles } from '../../design-system';
import { Habit,CleanTimeDuration } from '../../data/types';
import { usePremium } from '../../data/premium';
import { BACKGROUND_PALETTES,SHARE_TEMPLATES,ShareTemplateId,ShareBackgroundId,exportAndShareCard } from '../../utils/shareCardGenerator';
import { formatSavedMoney,formatReclaimedTime } from '../../utils/metrics';
import { useResponsiveRow } from '../../utils/useResponsiveRow';

interface Props {visible:boolean;onClose:()=>void;habit:Habit;cleanTime:CleanTimeDuration;longestStreak:number;moneySaved:number;hoursSaved:number}
export function ShareStreakModal({visible,onClose,habit,cleanTime,longestStreak,moneySaved,hoursSaved}:Props) {
  const {colors}=useTheme();const styles=useThemedStyles(baseStyles);
  const {isPremium,openPaywall}=usePremium();
  const footerLayout = useResponsiveRow(2, 150, 12);
  const [template,setTemplate]=useState<ShareTemplateId>('monumental');
  useEffect(()=>{if(!isPremium)setTemplate('monumental');},[isPremium]);
  const [background,setBackground]=useState<ShareBackgroundId>('zenSand');
  const [includeQuote,setQuote]=useState(false);const [includeStats,setStats]=useState(true);const [includeLiveTimer,setTimer]=useState(true);
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const flight=useRef(false);const card=useRef<View>(null);
  const palette=BACKGROUND_PALETTES[background];
  const options={habit,cleanTime,longestStreak,moneySaved,hoursSaved,template,background,includeQuote,includeStats,includeLiveTimer};
  const run=async(save=false)=>{if(flight.current)return;flight.current=true;setBusy(true);setMessage('');try{const result=await exportAndShareCard(options,card.current,save);setMessage(result.success ? save ? 'Image saved to app files.' : 'Opened in the system sharing sheet.' : 'Sharing cancelled.');}catch(e){setMessage(e instanceof Error?e.message:'Could not prepare the image. Please try again.');}finally{flight.current=false;setBusy(false);}};
  const close=()=>{if(!flight.current)onClose();};
  return <BottomSheet visible={visible} onClose={close} title="Share your progress" subtitle="Your moments, beautifully expressed." footer={<View onLayout={footerLayout.onLayout} style={[styles.actions,footerLayout.stacked&&styles.stackedActions]}><View style={[styles.actionItem,footerLayout.stacked&&styles.fullWidthAction]}><Button label="Save" variant="outline" disabled={busy} style={styles.actionButton} iconLeft={<Download size={18} color={colors.text.accent}/>} onPress={()=>run(true)} fullWidth/></View><View style={[styles.actionItem,footerLayout.stacked&&styles.fullWidthAction]}><Button label="Share image" loading={busy} style={styles.actionButton} iconLeft={<Share2 size={18} color={colors.text.inverse}/>} onPress={()=>run()} fullWidth/></View></View>}>
    <View ref={card} collapsable={false} style={[styles.preview,{backgroundColor:palette.gradientTop,borderColor:palette.cardBorder,minHeight:template==='story'?540:420}]}>
      <Text allowFontScaling={false} variant="caption" align="center" style={{color:palette.subtextColor,letterSpacing:1}}>KOMOREBI</Text>
      <Text allowFontScaling={false} align="center" numberOfLines={2} style={{color:palette.textColor,fontSize:16,marginTop:12}}>{habit.title}</Text>
      {template==='certificate'&&<Text allowFontScaling={false} serif align="center" style={{fontSize:22,color:palette.accentColor,marginTop:16}}>A promise, honored.</Text>}
      <View style={{flexGrow:1,justifyContent:'center',alignItems:template==='horizon'?'flex-start':'center',width:'100%',paddingVertical:24}}><Text allowFontScaling={false} serif tabular style={{fontSize:64,lineHeight:78,color:palette.textColor}}>{cleanTime.days}</Text><Text allowFontScaling={false} style={{color:palette.accentColor,fontSize:14}}>{cleanTime.days===1?'DAY OF PROGRESS':'DAYS OF PROGRESS'}</Text>{includeLiveTimer&&<Text allowFontScaling={false} variant="caption" style={{color:palette.subtextColor,marginTop:12}}>{cleanTime.hours}h · {cleanTime.minutes}m · {cleanTime.seconds}s</Text>}{template==='horizon'&&<View style={{marginTop:20,width:'100%',height:2,backgroundColor:palette.accentColor}}/>}</View>
      {includeQuote&&!!habit.pledge&&<Text allowFontScaling={false} serif align="center" numberOfLines={3} style={{color:palette.textColor,fontSize:18,lineHeight:25,marginBottom:20}}>“{habit.pledge}”</Text>}
      {includeStats&&<View style={[styles.previewStats,{borderTopColor:palette.cardBorder}]}>{[{label:'Best',value:`${longestStreak}d`},{label:'Saved',value:habit.financialTracking.enabled?formatSavedMoney(moneySaved,habit.financialTracking.currency):'—'},{label:'Reclaimed',value:habit.timeTracking.enabled?formatReclaimedTime(hoursSaved):'—'}].map(item=><View key={item.label} style={{flex:1,gap:4,alignItems:'center'}}><Text allowFontScaling={false} variant="caption" style={{color:palette.subtextColor}}>{item.label}</Text><Text allowFontScaling={false} variant="caption" weight="500" numberOfLines={1} style={{color:palette.accentColor}}>{item.value}</Text></View>)}</View>}
      <Text allowFontScaling={false} variant="caption" align="center" style={{color:palette.subtextColor,marginTop:16}}>One day. One choice. A little more light.</Text>
    </View>
    <Text variant="title3" style={styles.section}>Choose a template</Text>
    <View style={styles.templates}>{SHARE_TEMPLATES.map(item=>{const locked=item.id!=='monumental'&&!isPremium;return <TouchableOpacity key={item.id} disabled={busy} accessibilityRole="button" accessibilityLabel={`${item.name} template${locked?', Premium':''}`} accessibilityState={{selected:template===item.id}} onPress={()=>{if(locked){onClose();openPaywall('premium_share_styles');return;}setTemplate(item.id);setMessage('');}} style={[styles.template,template===item.id&&styles.selected]}><Text variant="caption" weight="500">{item.name}</Text><Text variant="caption" color="secondary">{item.tag}</Text>{locked&&<Lock size={14} color={colors.text.secondary}/>}</TouchableOpacity>;})}</View>
    <Text variant="title3" style={styles.section}>Background</Text><View style={styles.backgrounds}>{Object.values(BACKGROUND_PALETTES).map(item=><TouchableOpacity key={item.id} disabled={busy} onPress={()=>setBackground(item.id)} accessibilityRole="button" accessibilityLabel={`${item.name} background`} accessibilityState={{selected:background===item.id}} style={[styles.swatch,{backgroundColor:item.gradientTop,borderColor:background===item.id?colors.accent.primary:colors.border.subtle}]}><View style={{width:12,height:12,borderRadius:6,backgroundColor:item.accentColor}}/></TouchableOpacity>)}</View>
    <View style={styles.options}>{[{title:'Include your motivation',detail:'Only the affirmation you choose to share.',value:includeQuote,set:setQuote},{title:'Include savings',detail:'Your estimated savings and longest streak.',value:includeStats,set:setStats},{title:'Show exact time',detail:'Hours, minutes, and seconds.',value:includeLiveTimer,set:setTimer}].map(item=><View key={item.title} style={styles.option}><View style={{flex:1,gap:4}}><Text weight="500">{item.title}</Text><Text variant="caption" color="secondary">{item.detail}</Text></View><Toggle accessibilityLabel={item.title} value={item.value} onValueChange={item.set} disabled={busy}/></View>)}</View>
    <Text variant="caption" color="secondary" style={{marginTop:16}}>Journal notes, triggers, and urges are always excluded.</Text>{!!message&&<Text accessibilityRole="alert" color="accent" style={{marginTop:12}}>{message}</Text>}
  </BottomSheet>;
}
const baseStyles=StyleSheet.create({
  preview:{width:'100%',maxWidth:320,alignSelf:'center',borderRadius:24,borderWidth:1,padding:24,alignItems:'center'},
  previewStats:{flexDirection:'row',width:'100%',paddingTop:16,borderTopWidth:1,gap:8},
  actions:{flexDirection:'row',alignItems:'stretch',gap:12}, stackedActions:{flexDirection:'column'},
  actionItem:{flex:1,minWidth:0}, fullWidthAction:{flex:0,width:'100%'}, actionButton:{minHeight:56,paddingHorizontal:12,borderRadius:18},
  section:{marginTop:24,marginBottom:12}, templates:{flexDirection:'row',flexWrap:'wrap',gap:12},
  template:{width:'47%',flexGrow:1,borderWidth:1,borderColor:colors.border.subtle,backgroundColor:colors.background.surface,padding:16,borderRadius:16,gap:6},
  selected:{backgroundColor:colors.accent.primaryLight,borderColor:colors.accent.primary},
  backgrounds:{flexDirection:'row',gap:12,flexWrap:'wrap'}, swatch:{width:48,height:48,borderRadius:24,borderWidth:3,alignItems:'center',justifyContent:'center'},
  options:{marginTop:24,borderWidth:1,borderColor:colors.border.subtle,borderRadius:20,paddingHorizontal:16},
  option:{flexDirection:'row',gap:16,alignItems:'center',paddingVertical:16},
});
