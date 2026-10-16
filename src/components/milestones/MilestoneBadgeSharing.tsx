import React,{useEffect,useRef,useState} from 'react';
import {View,ScrollView,StyleSheet,Text as NativeText,Platform,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Svg,{Circle,Ellipse,G} from 'react-native-svg';
import {Check,ChevronLeft,Copy,Quote,Sprout,Share2} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import {Habit} from '../../data/types';
import {CalculatedMilestone} from '../../utils/milestones';
import {milestonePresentation} from '../../utils/milestonePresentation';
import {MILESTONE_SHARE_PALETTES,MILESTONE_SHARE_STYLES,MilestoneSharePalette,MilestoneShareStyle,milestoneShareText} from '../../utils/milestoneSharing';
import {exportNativeImage} from '../../utils/nativeImage';
import {MilestoneText as Text,MilestoneButton as Button,useMilestoneAppearance} from './milestoneAppearance';
import {MilestonePressable} from './MilestoneMotion';
import {MilestoneHabitIcon} from './MilestoneHabitIcon';

/** Slots share the detail's existing native Modal, avoiding competing modal presenters on iOS. */
export function useMilestoneBadgeSharing({habit,milestone,visible,onBack,onBusyChange}:{habit:Habit;milestone:CalculatedMilestone|null;visible:boolean;onBack:()=>void;onBusyChange:(busy:boolean)=>void}){
 const p=useMilestoneAppearance(),{width,height}=useWindowDimensions(),small=height<=760;
 const [style,setStyle]=useState<MilestoneShareStyle>('Classic'),[palette,setPalette]=useState(0),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[manual,setManual]=useState('');
 const preview=useRef<View>(null),previewSize=useRef({width:0,height:0}),flight=useRef(false),busyCallback=useRef(onBusyChange);busyCallback.current=onBusyChange;
 useEffect(()=>{if(visible){setMessage('');setError('');setManual('');}},[visible,milestone?.id]);
 const run=async(image:boolean)=>{
  if(flight.current||!milestone?.achieved)return;
  flight.current=true;setBusy(true);busyCallback.current(true);setMessage('');setError('');setManual('');
  try{if(image){const size=previewSize.current;if(!size.width||!size.height)throw new Error('The preview is still loading. Please try again.');setMessage(await exportNativeImage(preview.current,`sobrmate-${milestone.id}-${style.toLowerCase()}.png`,false,1080,Math.round(1080*size.height/size.width)));}
   else{if(!await Clipboard.setStringAsync(milestoneShareText(habit,milestone)))throw new Error('Clipboard unavailable');setMessage('Milestone text copied. Ready to share wherever you like.');}}
  catch(e){const message=e instanceof Error?e.message:'Could not prepare sharing. Please try again.';if(!image){setManual(milestoneShareText(habit,milestone));setError('Copy is unavailable here. Select the text below to share it.');}else setError(message.includes('Sharing is unavailable')?'Image sharing is unavailable on this device. You can copy your milestone text instead.':message);}
  finally{flight.current=false;setBusy(false);busyCallback.current(false);}
 };
 const tone=MILESTONE_SHARE_PALETTES[palette];
 const header=<View style={styles.header}><MilestonePressable disabled={busy} onPress={()=>{if(!flight.current)onBack();}} accessibilityRole="button" accessibilityLabel="Back from sharing" style={styles.headerIcon}><ChevronLeft size={20} strokeWidth={1.6} color={p.shareBack}/></MilestonePressable><Text weight="500" align="center" style={{flex:1,fontSize:14,lineHeight:21}}>Share your milestone</Text><View style={styles.headerIcon}/></View>;
 if(!milestone)return {header,body:null,footer:null};
 const body=<View style={{gap:small?12:18}}>
  {!small&&<View style={{alignItems:'center'}}><Text weight="500" style={{fontSize:8,lineHeight:12,letterSpacing:1.6,color:p.shareKicker}}>A MOMENT WORTH CELEBRATING</Text><Text serif style={{fontSize:25,lineHeight:31.25,letterSpacing:-.65,color:p.shareHeading,marginTop:7}}>Make this moment yours.</Text></View>}
  <View style={{alignItems:'center',paddingBottom:2}}><View ref={preview} collapsable={false} onLayout={event=>{previewSize.current=event.nativeEvent.layout;}} accessibilityLabel={`${habit.title} milestone, ${milestone.targetDays} days. ${style} style in ${tone.name}.`}><MilestoneBadgePreview habit={habit} milestone={milestone} template={style} palette={tone} compact={small} availableWidth={width-44}/></View></View>
  <View><View style={styles.controlHeading}><Text weight="500" style={[styles.controlTitle,{color:p.shareControl}]}>Choose a style</Text><Text style={[styles.controlValue,{color:p.shareCaption}]}>{style}</Text></View>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingTop:4,paddingHorizontal:3,paddingBottom:3}} style={{marginHorizontal:-3}} accessibilityRole="radiogroup" accessibilityLabel="Card style">
    {MILESTONE_SHARE_STYLES.map(item=><MilestonePressable key={item} disabled={busy} onPress={()=>{setStyle(item);setMessage('');setError('');}} accessibilityRole="radio" accessibilityLabel={`${item} style`} accessibilityState={{checked:style===item,disabled:busy}} style={{width:62,alignItems:'center'}}>
     <View style={{borderRadius:12,...(style===item?{shadowColor:'#D9CDE4',shadowOpacity:1,shadowRadius:1.5,shadowOffset:{width:0,height:0},elevation:1}:{})}}><View style={[styles.mini,style===item&&{borderColor:tone.ink},item==='Editorial'&&{alignItems:'flex-start',paddingLeft:9},small&&{height:64}]}>
      {style===item&&<LinearGradient colors={[tone.glow,tone.background]} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill}/>}
      <Text allowFontScaling={false} style={[styles.miniBrand,style===item&&{color:tone.muted},item==='Editorial'&&{left:9}]}>SobrMate</Text>
      {item==='Bloom'&&<Sprout size={14} strokeWidth={1.4} color={style===item?tone.ink:'#AB96B6'} style={{position:'absolute',top:17,right:5,opacity:.55}}/>}
      {item==='Focus'&&<View style={{position:'absolute',top:21,left:7,width:39,height:39,borderRadius:20,borderWidth:1,borderColor:style===item?tone.ink:'#AB96B6',opacity:.25}}/>}
      {item==='Letter'&&<Quote size={13} strokeWidth={1.3} color={style===item?tone.ink:'#AB96B6'} style={{position:'absolute',top:19,left:6,opacity:.3}}/>}
      <NativeText allowFontScaling={false} style={{includeFontPadding:false,fontFamily:Platform.OS==='ios'?'Georgia':'serif',fontSize:item==='Minimal'?23:item==='Letter'?22:24,lineHeight:item==='Minimal'?23:item==='Letter'?22:24,letterSpacing:-1,marginTop:7,fontWeight:'normal',color:style===item?tone.ink:'#AB96B6',...(item==='Minimal'?{fontFamily:Platform.OS==='ios'?'Arial':'sans-serif-light',fontWeight:'300' as const}:item==='Letter'?{fontStyle:'italic' as const}:{})}}>{milestone.targetDays}</NativeText><Text allowFontScaling={false} style={{fontSize:5,lineHeight:7.5,letterSpacing:.6,color:style===item?tone.ink:'#AB96B6'}}>{milestone.targetDays===1?'DAY':'DAYS'}</Text>
     </View>{style===item&&<View pointerEvents="none" style={{position:'absolute',top:-3,left:-3,right:-3,bottom:-3,borderRadius:15,borderWidth:1,borderColor:'#D9CDE4'}}/>}</View><Text weight={style===item?'500':'400'} style={{fontSize:9,lineHeight:13.5,marginTop:6,minHeight:18,color:style===item?'#715583':'#8A7497'}}>{item}</Text>
     {style===item&&<View style={styles.styleCheck}><Check size={9} strokeWidth={2} color="#FFFFFF"/></View>}
    </MilestonePressable>)}
   </ScrollView>
  </View>
  <View><View style={styles.controlHeading}><Text weight="500" style={[styles.controlTitle,{color:p.shareControl}]}>Color palette</Text><Text style={[styles.controlValue,{color:p.shareCaption}]}>{tone.name}</Text></View><View accessibilityRole="radiogroup" accessibilityLabel="Card color" style={{flexDirection:'row',justifyContent:'space-between',flexWrap:width<308?'wrap':'nowrap'}}>
   {MILESTONE_SHARE_PALETTES.map((item,i)=><MilestonePressable key={item.name} disabled={busy} onPress={()=>{setPalette(i);setMessage('');setError('');}} accessibilityRole="radio" accessibilityLabel={`${item.name} palette`} accessibilityState={{checked:palette===i,disabled:busy}} style={styles.colorTouch}>
    {palette===i&&<View style={{position:'absolute',top:3,left:3,right:3,bottom:3,borderRadius:22,borderWidth:1,borderColor:item.ink,opacity:.55}}/>}<View style={{width:30,height:30,borderRadius:15,backgroundColor:item.background,borderWidth:1,borderColor:item.border,transform:[{scale:palette===i?1.02:1}],alignItems:'center',justifyContent:'center'}}>{palette===i&&<Check size={15} strokeWidth={1.7} color={item.ink}/>}</View>
   </MilestonePressable>)}
  </View></View>
  {!!manual&&<View><Text style={{fontSize:11,lineHeight:16.5,color:p.shareCaption,marginBottom:8}}>Your milestone text</Text><Text selectable style={{fontSize:12,lineHeight:20.4,color:p.detailsInk,padding:12,borderRadius:14,borderWidth:1,borderColor:p.menuBorder,backgroundColor:p.surface}}>{manual}</Text></View>}
 </View>;
 const footer=<View>{!!(message||error)&&<Text accessibilityRole="alert" style={{fontSize:11,lineHeight:18.15,color:error?'#A56877':'#70835F',marginBottom:10}}>{error||message}</Text>}
  <Button label={busy?'Preparing…':'Share milestone'} fullWidth loading={busy} iconLeft={message?<Check size={17} strokeWidth={1.7} color={p.inverse}/>:<Share2 size={17} strokeWidth={1.7} color={p.inverse}/>} onPress={()=>run(true)} style={{minHeight:50,borderRadius:15,gap:9,shadowColor:'#6755A5',shadowOpacity:.086,shadowRadius:6,shadowOffset:{width:0,height:4},elevation:2}}/>
  <MilestonePressable disabled={busy} accessibilityRole="button" accessibilityLabel="Copy milestone text" onPress={()=>run(false)} hitSlop={{top:12,bottom:12,left:4,right:4}} style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,marginTop:9}}><Copy size={11} strokeWidth={1.6} color={p.shareHint}/><Text align="center" style={{fontSize:9,lineHeight:14.4,color:p.shareHint,flexShrink:1}}>Share your progress, or copy it to send later.</Text></MilestonePressable>
 </View>;
 return {header,body,footer};
}

function MilestoneBadgePreview({habit,milestone,template,palette,compact,availableWidth}:{habit:Habit;milestone:CalculatedMilestone;template:MilestoneShareStyle;palette:MilestoneSharePalette;compact:boolean;availableWidth:number}){
 const editorial=template==='Editorial',letter=template==='Letter',minimal=template==='Minimal',focus=template==='Focus';
 const width=Math.min(compact?216:260,availableWidth),height=compact?270:326;
 const title=milestonePresentation(milestone).title;
 const fontSize=letter?58:focus?(compact?60:67):template==='Bloom'?(compact?64:72):editorial?(compact?70:82):minimal?74:compact?67:78;
 return <LinearGradient colors={editorial||minimal?[palette.background,palette.background]:[palette.glow,palette.background]} start={{x:0,y:0}} end={{x:1,y:1}} locations={[0,.75]} style={{width,height,borderRadius:25,shadowColor:'#6D4F84',shadowOpacity:.063,shadowRadius:12,shadowOffset:{width:0,height:10},elevation:2,borderWidth:1,borderColor:palette.border,paddingTop:editorial?25:compact?20:24,paddingHorizontal:editorial?25:compact?18:22,paddingBottom:editorial?25:compact?17:20,overflow:'hidden'}}>
  <BadgeArt template={template} ink={palette.ink} background={palette.background} compact={compact} width={width}/>
  <View style={{flexDirection:'row',gap:6,alignItems:'center',justifyContent:editorial?'flex-start':'center',alignSelf:editorial?'flex-start':'center',maxWidth:'100%',borderWidth:editorial||minimal||letter?0:1,borderColor:palette.border,borderRadius:30,backgroundColor:editorial||minimal||letter?'transparent':'#FFFFFF55',paddingVertical:editorial||minimal?0:7,paddingHorizontal:editorial||minimal?0:10}}><MilestoneHabitIcon habit={habit} size={14} color={palette.ink}/><Text allowFontScaling={false} style={{fontSize:editorial?10:9,lineHeight:editorial?15:13.05,color:palette.ink,flexShrink:1,textAlign:editorial?'left':'center'}}>{habit.title} milestone</Text></View>
  <View style={{width:'100%',flex:1,alignItems:editorial?'flex-start':'center',justifyContent:focus?'flex-start':'center',paddingTop:focus?(compact?28:39):12,paddingBottom:12}}>
   {letter&&<Text allowFontScaling={false} style={{fontSize:9,lineHeight:13.5,letterSpacing:.1,color:palette.muted,marginBottom:14}}>A little promise, kept.</Text>}
   <View style={{flexDirection:letter?'row':'column',alignItems:letter?'baseline':editorial?'flex-start':'center',gap:letter?9:0}}><NativeText allowFontScaling={false} style={{includeFontPadding:false,fontFamily:minimal?Platform.OS==='ios'?'Arial':'sans-serif-light':Platform.OS==='ios'?'Georgia':'serif',fontWeight:minimal?'300':'normal',fontSize,lineHeight:fontSize*.98,letterSpacing:letter?-2:minimal?-3:-4,color:palette.ink}}>{milestone.targetDays}</NativeText><Text allowFontScaling={false} weight={letter?'400':'500'} serif={letter} style={{fontSize:letter?19:minimal?9:editorial?11:10,lineHeight:letter?28.5:minimal?13.5:editorial?16.5:15,letterSpacing:letter?-.3:editorial?1.8:minimal?2:2.2,color:palette.ink,marginTop:letter?0:10}}>{letter?(milestone.targetDays===1?'day':'days'):(milestone.targetDays===1?'DAY':'DAYS')}</Text></View>
   <Text allowFontScaling={false} style={{fontSize:10,lineHeight:14,color:palette.muted,marginTop:8,textAlign:editorial?'left':'center'}}>Milestone earned · {title}</Text>
   <Text allowFontScaling={false} serif={!minimal} numberOfLines={letter&&!compact?3:2} style={{fontSize:letter?(compact?14:17):minimal?11:compact||focus?12:13,lineHeight:letter?(compact?21.7:26.35):minimal?18.7:compact||focus?20.4:22.1,fontStyle:minimal?'normal':'italic',maxWidth:minimal?170:letter?210:205,color:palette.ink,marginTop:letter?19:focus?24:template==='Bloom'?17:compact?14:19,textAlign:editorial?'left':'center'}}>“{milestone.affirmation||'One day at a time.'}”</Text>
  </View>
  <View style={{width:'100%',flexDirection:'row',alignItems:'center',justifyContent:editorial?'space-between':'center',gap:8,...(editorial?{borderTopWidth:1,borderTopColor:palette.border,paddingTop:14}:{})}}><View style={{flexDirection:'row',alignItems:'center',gap:5}}><Sprout size={16} strokeWidth={1.5} color={palette.ink}/><Text allowFontScaling={false} weight="500" style={{fontSize:10,lineHeight:15,color:palette.ink}}>SobrMate</Text></View>{editorial&&<Text allowFontScaling={false} style={{fontSize:8,lineHeight:12,color:palette.muted}}>One day at a time</Text>}</View>
 </LinearGradient>;
}
function BadgeArt({template,ink,background,compact,width}:{template:MilestoneShareStyle;ink:string;background:string;compact:boolean;width:number}){
 if(template==='Minimal')return null;
 if(template==='Bloom')return <View pointerEvents="none" style={[StyleSheet.absoluteFill,{opacity:.09}]}><Svg width={compact?216:255} height={compact?216:255} viewBox="0 0 180 180" style={{position:'absolute',top:compact?26:31,left:compact?0:2,transform:[{rotate:'-12deg'}]}}><G stroke={ink} strokeWidth={1.2} fill="none">{Array.from({length:8},(_,i)=><Ellipse key={i} cx={90} cy={58} rx={20} ry={37} rotation={i*45} origin="90,90"/>)}<Circle cx={90} cy={90} r={12}/></G></Svg></View>;
 if(template==='Focus'){const size=compact?155:182,top=compact?47:53;return <View pointerEvents="none" style={[StyleSheet.absoluteFill,{opacity:.16}]}><Svg width={width} height={compact?270:326}><Circle cx={width/2} cy={top+size/2} r={size/2+5} fill="none" stroke={background} strokeWidth={9}/><Circle cx={width/2} cy={top+size/2} r={size/2+10} fill="none" stroke={ink} strokeWidth={1}/><Circle cx={width/2} cy={top+size/2} r={size/2} fill="none" stroke={ink} strokeWidth={1}/></Svg></View>;}
 if(template==='Letter')return <Quote size={92} strokeWidth={.7} color={ink} style={{position:'absolute',top:65,left:16,opacity:.055}}/>;
 return <View pointerEvents="none" style={[StyleSheet.absoluteFill,{opacity:template==='Editorial'?.07:.1}]}>{[0,1].map(i=><View key={i} style={{position:'absolute',width:template==='Editorial'?280:i?215:200,height:template==='Editorial'?280:i?215:200,right:template==='Editorial'?-110:i?-104:-106,top:template==='Editorial'?40:i?-76:-80,borderRadius:140,borderWidth:1,borderColor:ink}}/>)}</View>;
}
const styles=StyleSheet.create({
 header:{flexDirection:'row',alignItems:'center',gap:8},headerIcon:{width:44,height:44,borderRadius:14,alignItems:'center',justifyContent:'center'},
 controlHeading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:10},controlTitle:{fontSize:11,lineHeight:16.5},controlValue:{fontSize:10,lineHeight:15},
 mini:{height:70,width:55,borderRadius:12,borderWidth:1,borderColor:'#E8E0ED',backgroundColor:'#FFFEFC',position:'relative',overflow:'hidden',gap:2,alignItems:'center',justifyContent:'center'},miniBrand:{position:'absolute',top:7,fontSize:5,lineHeight:7.5,color:'#AA94B5',letterSpacing:.1},
 styleCheck:{position:'absolute',right:0,top:-2,width:15,height:15,borderRadius:8,backgroundColor:'#9C7DB5',borderWidth:2,borderColor:'#FAF9F6',alignItems:'center',justifyContent:'center'},colorTouch:{width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center'},
});
