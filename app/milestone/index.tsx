import React,{useCallback,useMemo,useState,useEffect,useRef} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {View,ScrollView,StyleSheet,useWindowDimensions} from 'react-native';
import {Award,ArrowLeft,ArrowRight,Sprout} from 'lucide-react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useRouter} from 'expo-router';
import {useRecoveryStore} from '../../src/data/store';
import {calculateMilestonesForHabit} from '../../src/utils/milestones';
import {milestonePresentation} from '../../src/utils/milestonePresentation';
import {getLocalDateString} from '../../src/utils/date';
import {triggerHaptic} from '../../src/utils/haptics';
import {MilestoneAppearance,MilestoneText as Text,MilestoneButton as Button,useMilestoneAppearance,MilestonePalette} from '../../src/components/milestones/milestoneAppearance';
import {MilestonesTrackerHeader} from '../../src/components/milestones/MilestonesTrackerHeader';
import {MilestoneCard} from '../../src/components/milestones/MilestoneCard';
import {MilestoneHabitIcon} from '../../src/components/milestones/MilestoneHabitIcon';
import {MilestoneEmblem} from '../../src/components/milestones/MilestoneEmblem';
import {MilestoneReveal,MilestonePressable,MilestoneProgress} from '../../src/components/milestones/MilestoneMotion';
import {MilestoneCertificateModal} from '../../src/components/milestones/MilestoneCertificateModal';
import {TastefulCelebrationOverlay} from '../../src/components/milestones/TastefulCelebrationOverlay';

export default function MilestonesScreen(){return <MilestoneAppearance><MilestonesContent/></MilestoneAppearance>;}
function MilestonesContent(){
 const p=useMilestoneAppearance(),styles=useMemo(()=>makeStyles(p),[p]),router=useRouter(),{fontScale,width}=useWindowDimensions();
 const {activeHabit,habits,currentTime}=useRecoveryStore('second'),habit=activeHabit||habits[0];
 const currentDays=habit?Math.max(0,Math.floor((currentTime.getTime()-Date.parse(habit.quitDate))/86400000)):0;
 const minute=Math.floor(currentTime.getTime()/60000),calendarDate=getLocalDateString(currentTime);
 // Keep the shared live clock for exact unlock boundaries; rows reuse their analysis between minute/day changes.
 const analysis=useMemo(()=>habit?calculateMilestonesForHabit(habit,currentTime):null,[habit,currentDays,minute,calendarDate]);
 const [filter,setFilter]=useState<'all'|'earned'|'upcoming'>('all'),[selectedId,setSelectedId]=useState<string|null>(null),[detailVisible,setDetailVisible]=useState(false),[celebrate,setCelebrate]=useState(false);
 const previousUnlock=useRef({id:habit?.id,count:analysis?.unlockedCount||0});
 useEffect(()=>{const previous=previousUnlock.current,count=analysis?.unlockedCount||0;if(previous.id===habit?.id&&count>previous.count)setCelebrate(true);previousUnlock.current={id:habit?.id,count};},[habit?.id,analysis?.unlockedCount]);
 useEffect(()=>{setSelectedId(null);setDetailVisible(false);setCelebrate(false);},[habit?.id]);
 const list=useMemo(()=>analysis?(filter==='earned'?analysis.unlocked:filter==='upcoming'?analysis.upcoming:[...analysis.unlocked,...analysis.upcoming]):[],[analysis,filter]);
 const selected=useMemo(()=>analysis?[...analysis.unlocked,...analysis.upcoming].find(item=>item.id===selectedId)||null:null,[analysis,selectedId]);
 const open=useCallback((id:string)=>{triggerHaptic('selection');setSelectedId(id);setDetailVisible(true);},[]);
 const close=useCallback(()=>setDetailVisible(false),[]),finishCelebration=useCallback(()=>setCelebrate(false),[]);
 const next=analysis?.nextMilestone,nextCopy=next?milestonePresentation(next):null,stack=fontScale>1.2||width<300;
 const completedUpcoming=filter==='upcoming'&&analysis?.upcomingCount===0;
 const daysRemaining=next?Math.max(0,next.targetDays-currentDays):0;
 return <SafeAreaView edges={['top','left','right']} style={styles.screen}>
  <MilestonesTrackerHeader habit={habit||null}/>
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
   <View style={styles.top}><View style={styles.journey}><MilestonePressable accessibilityRole="button" accessibilityLabel="Back to dashboard" onPress={()=>router.navigate('/(tabs)')} style={styles.back}><ArrowLeft size={18} strokeWidth={1.6} color={p.backInk}/></MilestonePressable><Text weight="600" style={styles.kicker}>YOUR JOURNEY</Text></View><Text weight="500" tabular style={styles.streak}>{currentDays} {currentDays===1?'day':'days'} clean</Text></View>
   <View style={styles.heading}><Text serif style={styles.title} accessibilityRole="header">Milestones</Text><Text style={styles.subtitle}>Every day is a step forward.</Text></View>
   {!habit||!analysis?<View style={styles.empty}><Sprout size={32} strokeWidth={1.3} color={p.emblemInk}/><Text serif align="center" style={styles.emptyTitle}>Every beginning matters.</Text><Text align="center" style={styles.emptyText}>Create a tracker to mark your first milestone.</Text><Button label="Create Tracker" variant="secondary" onPress={()=>router.push('/habit/new')}/></View>:<>
    <LinearGradient colors={p.feature} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.feature}>
     <View style={[styles.featureTop,stack&&styles.stacked]}><Text weight="600" style={[styles.kicker,{flexShrink:1,letterSpacing:1.15,fontSize:8,lineHeight:12}]}>{next?'YOUR NEXT MILESTONE':'A JOURNEY WORTH CELEBRATING'}</Text><View style={styles.earnedCount}><Award size={12} color={p.featureCaption}/><Text style={[styles.earnedLabel]}>{analysis.unlockedCount} / {analysis.totalMilestones} earned</Text></View></View>
     <View style={styles.hero}><View style={{flex:1,minWidth:0}}><Text serif style={styles.goalTitle}>{nextCopy?.title||'Every milestone earned'}</Text><Text style={styles.goalSubtitle}>{nextCopy?.subtitle||'Keep going at your own pace.'}</Text></View><View style={styles.featureIcon}><LinearGradient colors={p.featureIcon} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.featureIconInset}>{next?<MilestoneEmblem milestone={next} size={30} strokeWidth={1.25} color={p.featureIconInk}/>:<Sprout size={30} strokeWidth={1.25} color={p.featureIconInk}/>}</LinearGradient></View></View>
     {next&&<View style={styles.target}><Text style={styles.targetPill}>{daysRemaining} {daysRemaining===1?'day':'days'} to go</Text><Text style={[styles.targetDate]}>Target · {next.expectedDateFormatted}</Text></View>}
     <View style={styles.progressCaption}><Text style={styles.progressText}>{next?'One day at a time':'Look how far you have come'}</Text><Text weight="500" tabular style={[styles.progressText,{color:p.progressValue}]}>{next?`${currentDays} / ${next.targetDays} ${next.targetDays===1?'day':'days'}`:'All goals reached'}</Text></View>
     <View style={styles.progress}><MilestoneProgress progress={next?.progressPercent??100} label={next?'Progress toward '+nextCopy?.title:'Milestones completed'}/></View>
     <View style={[styles.featureFooter,stack&&styles.stacked]}><View style={styles.tracker}><MilestoneHabitIcon habit={habit} size={14} color={p.featureCaption}/><Text weight="500" numberOfLines={1} style={[styles.caption,{color:p.featureCaption,flexShrink:1}]}>{habit.title}</Text></View>{next?<MilestonePressable accessibilityRole="button" accessibilityLabel={'View next milestone, '+nextCopy?.title} onPress={()=>open(next.id)} style={styles.viewMilestone}><Text style={[styles.caption,{color:p.featureCaption}]}>View milestone</Text><ArrowRight size={15} strokeWidth={1.6} color={p.featureCaption}/></MilestonePressable>:<Text style={styles.caption}>Every step counts</Text>}</View>
    </LinearGradient>
    <View accessibilityRole="tablist" accessibilityLabel="Filter milestones" style={[styles.filters,stack&&styles.stacked]}>{([{id:'all',label:'All milestones',count:analysis.totalMilestones},{id:'earned',label:'Earned',count:analysis.unlockedCount},{id:'upcoming',label:'Upcoming',count:analysis.upcomingCount}] as const).map(item=><MilestonePressable key={item.id} accessibilityRole="tab" accessibilityState={{selected:filter===item.id}} accessibilityLabel={`${item.id==='all'?item.label:item.label+' milestones'}, ${item.count}`} onPress={()=>{setFilter(item.id);triggerHaptic('selection');}} style={[styles.filter,width<360&&{gap:4,paddingHorizontal:2},stack&&{flex:0,width:'100%'},filter===item.id&&styles.activeFilter]}><Text style={[styles.filterText,filter===item.id&&{color:p.title}]}>{item.id==='all'&&width<360?'All':item.label}</Text><Text tabular style={styles.count}>{item.count}</Text></MilestonePressable>)}</View>
    <MilestoneReveal identity={habit.id+'-'+filter} style={styles.list}>{list.map(item=><MilestoneCard key={item.id} milestone={item} currentDays={currentDays} onPress={open}/>)}
     {!list.length&&<View style={[styles.empty,{gap:0}]}><Sprout size={32} strokeWidth={1.3} color={p.emblemInk} style={{marginBottom:14}}/><Text serif align="center" style={[styles.emptyTitle,{marginBottom:10}]}>{completedUpcoming?'Every milestone earned.':'Your first milestone is ahead.'}</Text><Text align="center" style={[styles.emptyText,{marginBottom:16}]}>{completedUpcoming?'Keep going at your own pace. Every day is a step forward.':'Small steps count. Come back to celebrate\neach new moment of progress.'}</Text><Button label="Explore milestones" variant="secondary" style={{minHeight:44,borderRadius:13,paddingHorizontal:16}} labelStyle={{fontSize:11,lineHeight:16.5}} onPress={()=>setFilter('all')}/></View>}
    </MilestoneReveal>
    <View style={styles.note}><Sprout size={12} strokeWidth={1.5} color={p.noteInk}/><Text align="center" style={{fontSize:10,lineHeight:15,color:p.noteInk}}>Progress grows one day at a time.</Text></View>
   </>}
  </ScrollView>
  {habit&&<MilestoneCertificateModal visible={detailVisible} onClose={close} milestone={selected} habit={habit} currentDays={currentDays}/>}
  <TastefulCelebrationOverlay active={celebrate&&!detailVisible} onAnimationEnd={finishCelebration} accentColor={p.gold}/>
 </SafeAreaView>;
}
const makeStyles=(p:MilestonePalette)=>StyleSheet.create({
 screen:{flex:1,backgroundColor:p.canvas},content:{width:'100%',maxWidth:400,alignSelf:'center',paddingHorizontal:22,paddingTop:18,paddingBottom:28,gap:20},
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'},journey:{flexDirection:'row',alignItems:'center',gap:3},
 back:{width:44,height:44,marginLeft:-11,borderRadius:14,alignItems:'center',justifyContent:'center'},kicker:{fontSize:9,lineHeight:13.5,letterSpacing:1.65,color:p.kicker},
 streak:{fontSize:10,lineHeight:15,color:p.streakText,borderWidth:1,borderColor:p.streakBorder,backgroundColor:p.streakSurface,borderRadius:99,paddingVertical:8,paddingHorizontal:11},
 heading:{marginTop:-10},title:{fontSize:30,lineHeight:36,letterSpacing:-.8,color:p.ink,marginBottom:8},subtitle:{fontSize:12,lineHeight:19.2,color:p.secondary},
 feature:{padding:21,borderWidth:1,borderColor:p.featureBorder,borderRadius:26,shadowColor:'#5F467A',shadowOpacity:.02,shadowRadius:12,shadowOffset:{width:0,height:8},elevation:1},
 featureTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8,marginBottom:23},earnedCount:{flexDirection:'row',alignItems:'center',gap:5},
 hero:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},goalTitle:{fontSize:35,lineHeight:38.5,letterSpacing:-1,color:p.featureTitle,marginBottom:9},goalSubtitle:{fontSize:12,lineHeight:20.4,color:p.featureCaption},
 featureIcon:{width:66,height:66,borderRadius:23,borderWidth:1,borderColor:p.featureIconBorder,padding:4,backgroundColor:p.featureIconInset},featureIconInset:{flex:1,width:'100%',borderRadius:19,alignItems:'center',justifyContent:'center'},
 target:{flexDirection:'row',alignItems:'center',gap:10,flexWrap:'wrap',marginTop:19},targetPill:{fontSize:10,lineHeight:15,color:p.targetText,backgroundColor:p.targetSurface,borderWidth:1,borderColor:p.targetBorder,borderRadius:30,paddingVertical:5,paddingHorizontal:9},
 caption:{fontSize:11,lineHeight:16.5,color:p.caption},earnedLabel:{fontSize:10,lineHeight:15,color:p.featureCaption},targetDate:{fontSize:10,lineHeight:16,color:p.featureCaption},progressText:{fontSize:10,lineHeight:15,color:p.featureCaption},progressCaption:{flexDirection:'row',justifyContent:'space-between',gap:8,flexWrap:'wrap',marginTop:22},progress:{marginTop:9,marginBottom:18},
 featureFooter:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,borderTopWidth:1,borderTopColor:p.divider,paddingTop:10},tracker:{flexDirection:'row',alignItems:'center',gap:6,flex:1,minWidth:0},
 viewMilestone:{minHeight:44,marginTop:-3,marginBottom:-7,marginRight:-8,paddingHorizontal:8,borderRadius:12,flexDirection:'row',alignItems:'center',gap:7},
 filters:{flexDirection:'row',gap:4,backgroundColor:p.filterSurface,borderWidth:1,borderColor:p.filterBorder,padding:4,borderRadius:15},
 filter:{flex:1,minHeight:44,borderRadius:11,paddingHorizontal:4,paddingVertical:6,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:8},filterText:{fontSize:11,lineHeight:16.5,color:p.filterText,flexShrink:1},
 count:{fontSize:9,lineHeight:13.5,minWidth:18,color:p.countInk,backgroundColor:p.countSurface,borderRadius:7,paddingVertical:2,paddingHorizontal:4,textAlign:'center'},
 activeFilter:{backgroundColor:p.surface,shadowColor:'#302B40',shadowOpacity:.025,shadowRadius:3,shadowOffset:{width:0,height:2},elevation:1},
 list:{gap:9,marginTop:-8},note:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:6,paddingVertical:4},
 empty:{alignItems:'center',paddingVertical:28,paddingHorizontal:18,borderWidth:1,borderColor:p.border,borderRadius:22,backgroundColor:p.surface,gap:14},
 emptyTitle:{fontSize:23,lineHeight:34.5,color:p.title},emptyText:{fontSize:12,lineHeight:20.4,color:p.secondary},stacked:{flexDirection:'column',alignItems:'stretch'},
});
