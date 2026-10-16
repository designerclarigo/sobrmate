import React,{useRef,useState,useEffect,useMemo,useCallback} from 'react';
import {View,StyleSheet,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Calendar,ChevronLeft,PartyPopper,Share2,Sparkles} from 'lucide-react-native';
import {Habit} from '../../data/types';
import {CalculatedMilestone} from '../../utils/milestones';
import {milestonePresentation} from '../../utils/milestonePresentation';
import {exportNativeImage} from '../../utils/nativeImage';
import {TastefulCelebrationOverlay} from './TastefulCelebrationOverlay';
import {MilestonePanel} from './MilestonePanel';
import {MilestoneEmblem} from './MilestoneEmblem';
import {MilestoneReveal,MilestonePressable} from './MilestoneMotion';
import {MilestoneText as Text,MilestoneButton as Button,useMilestoneAppearance,MilestonePalette} from './milestoneAppearance';
import {useMilestoneBadgeSharing} from './MilestoneBadgeSharing';

interface Props{visible:boolean;onClose:()=>void;milestone:CalculatedMilestone|null;habit:Habit;currentDays?:number;onCelebrateAgain?:()=>void}
export const MilestoneCertificateModal=React.memo(function MilestoneCertificateModal({visible,onClose,milestone,habit,currentDays=0,onCelebrateAgain}:Props){
 const p=useMilestoneAppearance(),styles=useMemo(()=>makeStyles(p),[p]),{width,fontScale}=useWindowDimensions();
 const preview=useRef<View>(null),flight=useRef(false),previewSize=useRef({width:0,height:0});
 const [certificate,setCertificate]=useState(false),[sharing,setSharing]=useState(false),[celebrating,setCelebrating]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const stack=fontScale>1.2||width<300;
 useEffect(()=>{if(visible){setCertificate(false);setSharing(false);setMessage('');setCelebrating(!!milestone?.achieved);}else setCelebrating(false);},[visible,milestone?.id,milestone?.achieved]);
 const close=useCallback(()=>{if(!flight.current)onClose();},[onClose]);
 const badge=useMilestoneBadgeSharing({habit,milestone,visible:visible&&sharing,onBack:close,onBusyChange:value=>{flight.current=value;setBusy(value);}});
 const finishCelebration=useCallback(()=>setCelebrating(false),[]);
 const celebrate=()=>{setCelebrating(true);onCelebrateAgain?.();};
 const share=async()=>{
  if(flight.current||!milestone?.achieved)return;
  flight.current=true;setBusy(true);setMessage('');
  try{const height=previewSize.current.width>0?Math.round(previewSize.current.height/previewSize.current.width*1080):undefined;
   setMessage(await exportNativeImage(preview.current,`komorebi-${milestone.id}.png`,false,1080,height));}
  catch(e){setMessage(e instanceof Error?e.message:'Could not prepare the certificate. Please try again.');}
  finally{flight.current=false;setBusy(false);}
 };
 if(!milestone)return null;
 const copy=milestonePresentation(milestone),remaining=Math.max(0,milestone.targetDays-currentDays);
 const date=milestone.achievedDateFormatted||milestone.expectedDateFormatted||'Date unavailable';
 return <MilestonePanel visible={visible} onClose={close} closeDisabled={busy} center={certificate} sharing={sharing} header={sharing?badge.header:undefined} footer={sharing?badge.footer:undefined}>
  <MilestoneReveal identity={milestone.id+(sharing?'-share':certificate?'-certificate':'-detail')}>
   {sharing?badge.body:<>
   {certificate?<View style={{paddingTop:40}}>
    <MilestonePressable accessibilityRole="button" accessibilityLabel="Back to milestone details" disabled={busy} onPress={()=>{setCertificate(false);setMessage('');}} style={styles.back}><ChevronLeft size={17} color={p.title}/><Text color="accent" style={styles.small}>Milestone details</Text></MilestonePressable>
    <Text weight="600" align="center" style={styles.certificateTitle} accessibilityRole="header">Milestone Certificate</Text>
    <View ref={preview} collapsable={false} onLayout={event=>{previewSize.current=event.nativeEvent.layout;}} style={styles.certificate}>
     <Text allowFontScaling={false} align="center" style={styles.certificateBrand}>SOBRMATE · ONE DAY AT A TIME</Text>
     <View style={styles.certificateSeal}><MilestoneEmblem milestone={milestone} size={38} strokeWidth={1.3} color={p.title}/></View>
     <Text allowFontScaling={false} weight="600" align="center" style={styles.honored}>✧ HONORED</Text>
     <Text allowFontScaling={false} align="center" style={styles.certificateLabel}>{(milestone.timeLabel||copy.title).toUpperCase()} · {habit.title.toUpperCase()}</Text>
     <Text allowFontScaling={false} serif align="center" style={styles.certificateName}>{milestone.title}</Text>
     <Text allowFontScaling={false} align="center" style={styles.certificateDescription}>{milestone.description}</Text>
     <View style={styles.certificateQuote}><Sparkles size={17} color={p.title}/><Text allowFontScaling={false} align="center" style={styles.certificateAffirmation}>“{milestone.affirmation}”</Text></View>
     <View style={styles.certificateDate}><Calendar size={13} color={p.earnedInk}/><Text allowFontScaling={false} style={styles.small}>Achieved {date}</Text></View>
    </View>
    <View style={[styles.actions,stack&&styles.stackedActions]}><View style={stack?undefined:{flex:1}}><Button label="Celebrate" variant="secondary" disabled={busy} iconLeft={<PartyPopper size={15} color={p.gold}/>} onPress={celebrate} fullWidth/></View><View style={stack?undefined:{flex:1.7}}><Button label="Share Certificate" iconLeft={<Share2 size={15} color={p.inverse}/>} loading={busy} onPress={share} fullWidth/></View></View>
    {!!message&&<Text accessibilityRole="alert" color="accent" style={[styles.small,{marginTop:12}]}>{message}</Text>}
    <Button label="Done" variant="ghost" disabled={busy} onPress={close} fullWidth style={{marginTop:8}}/>
   </View>:<View>
    <LinearGradient colors={milestone.achieved?p.detailBadge:p.lockedBadge} start={{x:0,y:0}} end={{x:1,y:1}} style={[styles.detailBadge,{borderColor:milestone.achieved?p.detailBadgeBorder:p.lockedBorder}]}>
     <View pointerEvents="none" style={[styles.badgeRim,{borderColor:p.canvas}]}/>
     <View style={[styles.badgeInset,{borderColor:milestone.achieved?p.detailBadgeInset:p.lockedInset}]}><MilestoneEmblem milestone={milestone} size={42} strokeWidth={1.15} color={milestone.achieved?p.gold:p.lockedInk}/></View>
    </LinearGradient>
    <Text weight="600" align="center" style={styles.kicker}>{milestone.achieved?'A MOMENT WORTH CELEBRATING':'YOUR NEXT STEPS'}</Text>
    <Text serif align="center" style={styles.detailTitle} accessibilityRole="header">{copy.title}</Text>
    <Text align="center" style={styles.detailSubtitle}>{copy.subtitle}</Text>
    <LinearGradient colors={p.quote} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.quote}><Text serif align="center" style={styles.quoteText}>“{milestone.affirmation}”</Text></LinearGradient>
    <View style={styles.facts}>{[{label:'Milestone goal',value:`${milestone.targetDays} ${milestone.targetDays===1?'day':'days'}`},{label:milestone.achieved?'Reached on':'Target date',value:date},{label:'Status',value:milestone.achieved?'Earned':`${remaining} ${remaining===1?'day':'days'} to go`}].map(item=><View key={item.label} style={[styles.fact,stack&&styles.stackedFact]}><Text style={styles.factLabel}>{item.label}</Text><Text weight="500" style={[styles.factValue,stack&&{textAlign:'left'}]}>{item.value}</Text></View>)}</View>
    <View style={[styles.actions,stack&&styles.stackedActions]}><View style={stack?undefined:{flex:1}}><Button label={milestone.achieved?'Close':'Keep going'} variant="secondary" onPress={close} fullWidth/></View>{milestone.achieved&&<View style={stack?undefined:{flex:1}}><Button label="Share badge" iconLeft={<Share2 size={15} color={p.inverse}/>} onPress={()=>{setSharing(true);setCelebrating(false);}} fullWidth/></View>}</View>
    {milestone.achieved&&<><Button label="View certificate" variant="ghost" onPress={()=>setCertificate(true)} fullWidth style={{marginTop:8}}/><Button label="Celebrate this moment" variant="ghost" iconLeft={<PartyPopper size={15} color={p.gold}/>} onPress={celebrate} fullWidth/></>}
   </View>}
   </>}
  </MilestoneReveal>
  <TastefulCelebrationOverlay active={visible&&celebrating} onAnimationEnd={finishCelebration} accentColor={p.gold}/>
 </MilestonePanel>;
});
const makeStyles=(p:MilestonePalette)=>StyleSheet.create({
 small:{fontSize:12,lineHeight:19.2},kicker:{fontSize:9,lineHeight:24,letterSpacing:1.65,color:p.kicker},
 detailBadge:{width:108,height:108,borderRadius:54,borderWidth:1,alignSelf:'center',marginTop:30,marginBottom:18,padding:6},
 badgeRim:{position:'absolute',top:0,left:0,right:0,bottom:0,borderWidth:6,borderRadius:54},
 badgeInset:{flex:1,width:'100%',borderWidth:1,borderRadius:48,alignItems:'center',justifyContent:'center'},
 detailTitle:{fontSize:30,lineHeight:45,letterSpacing:-.7,color:p.heading,marginVertical:9},detailSubtitle:{fontSize:12,lineHeight:20.4,color:p.detailSubtitle},
 quote:{borderWidth:1,borderColor:p.quoteBorder,borderRadius:22,padding:23,marginVertical:22},quoteText:{fontSize:15,lineHeight:26.25,color:p.quoteInk},
 facts:{padding:18,borderRadius:19,borderWidth:1,borderColor:p.quoteBorder,backgroundColor:p.surface,gap:17},
 fact:{flexDirection:'row',justifyContent:'space-between',gap:15},factLabel:{fontSize:12,lineHeight:19.2,color:p.detailLabel,flexShrink:1},factValue:{fontSize:12,lineHeight:19.2,color:p.detailsInk,textAlign:'right',flexShrink:1},
 stackedFact:{flexDirection:'column',gap:4},actions:{flexDirection:'row',gap:10,marginTop:22},stackedActions:{flexDirection:'column'},
 back:{flexDirection:'row',alignItems:'center',gap:6,minHeight:44,alignSelf:'flex-start',marginTop:-24},certificateTitle:{fontSize:16,lineHeight:24,marginTop:8,marginBottom:18},
 certificate:{padding:20,borderRadius:20,borderWidth:1,borderColor:p.goldBorder,backgroundColor:p.canvas},
 certificateBrand:{fontSize:8,lineHeight:12,letterSpacing:.8,color:p.caption},certificateSeal:{width:76,height:76,borderRadius:38,borderWidth:1,borderStyle:'dashed',borderColor:p.title,backgroundColor:p.goldSurface,alignItems:'center',justifyContent:'center',alignSelf:'center',marginTop:20},
 honored:{fontSize:12,lineHeight:18,color:'#FFFFFF',backgroundColor:'#C69B45',borderRadius:20,paddingHorizontal:10,paddingVertical:3,alignSelf:'center',marginTop:-8},
 certificateLabel:{fontSize:12,lineHeight:18,letterSpacing:.6,color:p.title,marginTop:8},certificateName:{fontSize:22,lineHeight:28,color:p.ink,marginTop:8,marginBottom:8},
 certificateDescription:{fontSize:13,lineHeight:19.5,color:p.secondary},certificateQuote:{padding:14,borderRadius:16,borderWidth:1,borderColor:p.quoteBorder,backgroundColor:p.surface,marginVertical:16,alignItems:'center',gap:8},
 certificateAffirmation:{fontSize:13,lineHeight:20.8,fontStyle:'italic',color:p.ink},certificateDate:{flexDirection:'row',justifyContent:'center',gap:6,alignItems:'center',flexWrap:'wrap',borderTopWidth:1,borderTopColor:p.quoteBorder,paddingTop:12},
});
