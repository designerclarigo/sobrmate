import React,{useMemo,useRef,useState} from 'react';
import {View,StyleSheet,useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SvgXml} from 'react-native-svg';
import {Check,ChevronLeft,Download,Share2,Sparkles} from 'lucide-react-native';
import {colors,useTheme,useThemedStyles} from '../../design-system';
import {CalendarButton as Button,CalendarText as Text} from './calendarAppearance';
import {CalendarPanel} from './CalendarPanel';
import {CalendarPressable} from './CalendarMotion';
import {CheckIn,Habit} from '../../data/types';
import {renderYearCardSvg,YearCardFormat} from '../../utils/yearCard';
import {exportYearCard} from '../../utils/exportYearCard';

export function YearShareModal({visible,onClose,habit,entries,year,today}:{visible:boolean;onClose:()=>void;habit:Habit;entries:CheckIn[];year:number;today:string}){
 const {colors,isDark}=useTheme();const styles=useThemedStyles(baseStyles);const {width,height,fontScale}=useWindowDimensions();const insets=useSafeAreaInsets();
 const [format,setFormat]=useState<YearCardFormat>('story'),[includeTracker,setIncludeTracker]=useState(true);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const preview=useRef<View>(null),inFlight=useRef(false);
 const options=useMemo(()=>({habit,entries,year,today,format,includeTracker}),[habit,entries,year,today,format,includeTracker]);
 const xml=useMemo(()=>renderYearCardSvg(options),[options]);
 const ratio=format==='story'?1920/1080:1350/1080;
 const previewWidth=Math.min(Math.min(430,width-32)-42,(format==='story'?390:360)/ratio);
 const stack=fontScale>1.2||width<330;
 const run=async(share:boolean)=>{
  if(inFlight.current)return;
  inFlight.current=true;setBusy(true);setMessage('');
  try{setMessage(await exportYearCard(options,preview.current,share));}
  catch(e){setMessage(e instanceof Error?e.message:'Could not export your card. Please try again.');}
  finally{inFlight.current=false;setBusy(false);}
 };
 const close=()=>{if(!inFlight.current)onClose();};
 const header=<View style={styles.header}><CalendarPressable accessibilityRole="button" accessibilityLabel="Back to annual statistics" disabled={busy} onPress={close} style={styles.back}><ChevronLeft size={19} color={colors.accent.primary}/></CalendarPressable><Text weight="600" style={styles.title} accessibilityRole="header">Share your year</Text><View style={styles.back}><Sparkles size={17} color={colors.text.tertiary}/></View></View>;
 const footer=<View style={{gap:8}}><View style={[styles.actions,stack&&{flexDirection:'column'}]}><View style={[styles.action,stack&&{flexBasis:'auto'}]}><Button label="Save image" variant="outline" iconLeft={<Download size={16} color={colors.accent.primary}/>} disabled={busy} onPress={()=>run(false)} fullWidth/></View><View style={[styles.action,stack&&{flexBasis:'auto'}]}><Button label="Share image" iconLeft={<Share2 size={16} color={colors.text.inverse}/>} loading={busy} onPress={()=>run(true)} fullWidth/></View></View><Text accessibilityRole={message?'alert':undefined} color="tertiary" align="center" style={styles.small}>{message||'Choose where to share from your device’s share sheet.'}</Text></View>;
 return <CalendarPanel visible={visible} onClose={close} presentation="center" handle={false} header={header} footer={footer} style={{maxWidth:430,height:Math.min(920,height-insets.top-insets.bottom-16),borderColor:isDark?colors.border.subtle:'#FFFFFFB3'}}>
  <Text color="tertiary" style={styles.caption}>Your little moments, beautifully together.</Text>
  <View style={styles.previewWrap}><View style={[styles.previewFrame,{width:previewWidth,height:previewWidth*ratio}]}><View ref={preview} collapsable={false} style={{width:'100%',height:'100%'}} accessibilityLabel={`${year} year card preview. Private notes are excluded.`}><SvgXml xml={xml} width="100%" height="100%"/></View></View></View>
  <View style={[styles.formats,{backgroundColor:isDark?colors.accent.primaryLight:'#EDE8F5'},stack&&{flexDirection:'column'}]} accessibilityRole="tablist">{([{id:'story',title:'Story',detail:'9:16 · 1080 × 1920'},{id:'post',title:'Post',detail:'4:5 · 1080 × 1350'}] as const).map(item=><CalendarPressable key={item.id} disabled={busy} accessibilityRole="tab" accessibilityLabel={`${item.title} format`} accessibilityState={{selected:format===item.id}} onPress={()=>{setFormat(item.id);setMessage('');}} style={[styles.format,stack&&{flex:0,width:'100%'},format===item.id&&styles.selected]}><Text weight="600" color={format===item.id?'accent':'tertiary'} style={styles.small}>{item.title}</Text><Text color="tertiary" style={styles.small}>{item.detail}</Text></CalendarPressable>)}</View>
  <CalendarPressable disabled={busy} accessibilityRole="checkbox" accessibilityLabel="Include tracker name" accessibilityState={{checked:includeTracker}} onPress={()=>{setIncludeTracker(value=>!value);setMessage('');}} style={styles.toggle}><Text color="secondary" style={[styles.small,{flex:1}]}>Include tracker name</Text><View style={[styles.check,includeTracker&&{backgroundColor:colors.accent.primary}]}>{includeTracker&&<Check size={14} color={colors.text.inverse}/>}</View></CalendarPressable>
  <Text color="tertiary" style={styles.small}>The image includes your calendar and stats. Notes and profile details stay private.</Text>
 </CalendarPanel>;
}
const baseStyles=StyleSheet.create({
 header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
 back:{width:44,height:44,borderRadius:14,justifyContent:'center',alignItems:'center'},title:{flex:1,fontSize:14,lineHeight:21,textAlign:'center'},
 caption:{fontSize:12,lineHeight:18,textAlign:'center',marginBottom:12},small:{fontSize:12,lineHeight:18},
 previewWrap:{alignItems:'center',marginBottom:16},
 previewFrame:{borderWidth:1,borderColor:colors.border.subtle,borderRadius:12,overflow:'hidden',backgroundColor:colors.background.canvas,shadowColor:'#3A2A50',shadowOpacity:.08,shadowRadius:14,shadowOffset:{width:0,height:6},elevation:2},
 formats:{flexDirection:'row',padding:4,backgroundColor:'#EDE8F5',borderRadius:16,gap:4},
 format:{flex:1,alignItems:'center',justifyContent:'center',borderRadius:12,minHeight:44,paddingVertical:6,paddingHorizontal:4},
 selected:{backgroundColor:colors.background.surface,shadowColor:'#302B40',shadowOpacity:.04,shadowRadius:2,shadowOffset:{width:0,height:1},elevation:1},
 toggle:{flexDirection:'row',gap:12,justifyContent:'space-between',alignItems:'center',minHeight:44,marginTop:12},
 check:{width:20,height:20,borderRadius:4,borderWidth:1,borderColor:colors.accent.primary,alignItems:'center',justifyContent:'center'},
 actions:{flexDirection:'row',gap:8},action:{flexGrow:1,flexBasis:0},
});
