import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, ScrollView, View } from 'react-native';
import { Bell, ChevronRight, Clock, CodeXml, Crown, Download, FileText, Heart, LayoutGrid, Lock, MessageSquare, Play, RotateCcw, ShieldCheck, Star, Trash2, Upload, Hand, Smartphone, User, CircleQuestionMark } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useRecoveryStore } from '../../src/data/store';
import { RecoveryData } from '../../src/data/recovery';
import { usePremium } from '../../src/data/premium';
import { useAuth } from '../../src/auth/AuthProvider';
import { notificationService } from '../../src/utils/notifications';
import { exportBackup, pickBackup } from '../../src/utils/backup';
import { clearPasscode } from '../../src/utils/security';
import { ScreenVisibilityContext } from '../../src/components/ScreenVisibility';
import { SettingsMembership } from '../../src/components/settings/SettingsMembership';
import { ProfileSettings } from '../../src/components/settings/ProfileModal';
import { ReminderSettings } from '../../src/components/settings/ReminderTimeModal';
import { AppLockSettings } from '../../src/components/settings/AppLockModal';
import { WidgetSettings } from '../../src/components/settings/WidgetSettings';
import { BlockedSettings, FeatureRequestSettings, HelpCenterSettings, LegalSettings, ProSettings, RatingSettings, ReplaySettings } from '../../src/components/settings/SupportModals';
import { useSettingsPreferences } from '../../src/components/settings/useSettingsPreferences';
import { saveFeatureDraft, SETTINGS_PREFERENCES_KEY } from '../../src/components/settings/settingsPreferences';
import { SettingsButton, SettingsBusyContext, SettingsCard, SettingsCopy, SettingsField, SettingsGroup, SettingsHero, SettingsLink, SettingsMotionProvider, SettingsNotice, SettingsOperationContext, SettingsPanel, SettingsPressable, SettingsRow, SettingsSegments, SettingsText, SettingsToggle, useSettingsPalette } from '../../src/components/settings/SettingsUI';

const titles={home:'Settings',pro:'SobrMate Pro',plans:'Mock Premium plans',membership:'Your membership', 'premium-success':'Mock Premium active',profile:'Your profile',intro:'Replay introduction',feature:'Request a feature',dashboard:'Dashboard',widget:'Home screen widget',notifications:'Notifications',reminder:'Daily pledge reminder',reflection:'Daily check-in reminder',lock:'App lock',blocked:'Blocked accounts',rating:'Rate your experience',help:'Help center',source:'Expo source',privacy:'Privacy',terms:'Terms of use',reset:'Reset streak counter',erase:'Erase device data',restore:'Restore backup'} as const;
type Page=keyof typeof titles;
export default function SettingsScreen() {
  const focused=useContext(ScreenVisibilityContext);
  return focused?<SettingsContent/>:<View style={{flex:1}}/>;
}
function SettingsContent() {
  const auth=useAuth();
  const p=useSettingsPalette(),store=useRecoveryStore(),premium=usePremium(),router=useRouter(),preferences=useSettingsPreferences();
  const {settings,updateSettings,activeHabit,habits,activeHabitId,checkIns,pledges,hasCompletedOnboarding,onboardingStep,hasCompletedSetup,setupDraft,restoreBackup,deleteAccount,resetHabit}=store;
  const [page,setPage]=useState<Page>('home'),[operations,setOperations]=useState(0),[message,setMessage]=useState(''),[error,setError]=useState('');
  const [backup,setBackup]=useState<RecoveryData|null>(null),[reason,setReason]=useState(''),[eraseText,setEraseText]=useState('');
  const [permission,setPermission]=useState<boolean|null>(null),[permissionError,setPermissionError]=useState('');
  const flight=useRef(false),scroll=useRef<ScrollView>(null),busy=operations>0;
  const operation=useCallback((delta:number)=>setOperations(value=>Math.max(0,value+delta)),[]);
  const go=(next:Page)=>{if(busy||flight.current)return;setMessage('');setError('');setPage(next);};
  const close=()=>{if(!busy&&!flight.current)router.navigate('/(tabs)');};
  const readPermission=useCallback(async()=>{setPermissionError('');try{setPermission(await notificationService.checkPermissionStatus());}catch(e){setPermission(null);setPermissionError(e instanceof Error?e.message:'Unable to read notification permission.');}},[]);
  useEffect(()=>{if(page!=='notifications')return;void readPermission();const sub=AppState.addEventListener('change',state=>{if(state==='active')void readPermission();});return()=>sub.remove();},[page,readPermission]);
  const run=async(action:()=>Promise<void>)=>{if(flight.current)return;flight.current=true;operation(1);setError('');setMessage('');try{await action();}catch(e){setError(e instanceof Error?e.message:'Unable to complete this action. Please try again.');}finally{flight.current=false;operation(-1);}};
  const enableNotifications=async(value:boolean)=>{
    if(value&&!(await notificationService.requestPermissions()))throw new Error('Reminders need notification permission. Enable it in your device settings.');
    await updateSettings({notificationsEnabled:value});await readPermission();
  };
  const requestPermission=async()=>{const granted=await notificationService.requestPermissions();setPermission(granted);setMessage(granted?'Device notification permission is allowed. Enable your chosen reminders to schedule them.':'Permission was not granted. Review it in device settings to receive reminders.');};
  const exportJourney=()=>run(async()=>{await exportBackup({habits,activeHabitId,checkIns,pledges,settings,hasCompletedOnboarding,onboardingStep,hasCompletedSetup,setupDraft});setMessage('Backup prepared. Choose a destination in the system sharing sheet.');});
  const chooseBackup=()=>run(async()=>{const selected=await pickBackup();if(selected){setBackup(selected);setPage('restore');}});
  const draftsReady=!preferences.loading&&!preferences.error;
  const redRow=(label:string,onPress:()=>void,Icon=RotateCcw)=><SettingsPressable disabled={busy} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{minHeight:52,paddingHorizontal:16,paddingVertical:12,borderRadius:16,borderWidth:1,borderColor:p.dangerBorder,backgroundColor:p.dangerSoft,flexDirection:'row',alignItems:'center',gap:10}}><Icon size={17} color={p.danger}/><SettingsText style={{flex:1,color:p.danger}}>{label}</SettingsText><ChevronRight size={16} color={p.danger}/></SettingsPressable>;
  return <View style={{flex:1,backgroundColor:p.canvas}}><SettingsMotionProvider><SettingsOperationContext.Provider value={operation}><SettingsBusyContext.Provider value={busy}><SettingsPanel scrollRef={scroll} page={page} title={titles[page]} onBack={page==='home'?undefined:()=>go('home')} onClose={close} hidden={!!premium.screen} busy={busy}>
    {page==='home'&&<>
      <View><SettingsText weight="600" style={{fontSize:9,lineHeight:14.4,letterSpacing:1.5,color:p.kicker}}>MAKE IT YOURS</SettingsText><SettingsText serif style={{fontSize:28,lineHeight:33.6,letterSpacing:-.65,color:p.ink,marginVertical:8}}>A little more personal.</SettingsText><SettingsText style={{fontSize:12,lineHeight:20.4}}>A calm space for your preferences.</SettingsText></View>
      <SettingsPressable accessibilityRole="button" accessibilityLabel="SobrMate Pro, More room to grow, Explore what’s ahead" onPress={()=>go('pro')}><LinearGradient colors={[p.goldSoft,p.goldEnd]} start={{x:0,y:0}} end={{x:1,y:1}} style={{paddingVertical:20,paddingHorizontal:16,borderWidth:1,borderColor:p.goldBorder,borderRadius:23,flexDirection:'row',alignItems:'center',gap:14}}>
        <View style={{width:48,height:54,borderWidth:1,borderColor:p.goldBorder,borderRadius:18,backgroundColor:p.surface+'70',alignItems:'center',justifyContent:'center'}}><Crown size={27} strokeWidth={1.35} color={p.gold}/></View><View style={{flex:1}}><SettingsText weight="600" style={{fontSize:9,lineHeight:14.4,letterSpacing:1.5,color:p.gold}}>SOBRMATE PRO</SettingsText><SettingsText serif style={{fontSize:21,lineHeight:33.6,letterSpacing:-.4,color:p.gold,marginVertical:5}}>More room to grow.</SettingsText><SettingsText style={{fontSize:11,lineHeight:17.6,color:p.gold}}>Explore what’s ahead</SettingsText></View><ChevronRight size={18} color={p.gold}/>
      </LinearGradient></SettingsPressable>
      <SettingsGroup title="You & your journey"><SettingsRow first icon={User} title="Your profile" detail={settings.userName} onPress={()=>go('profile')}/><SettingsRow icon={Play} title="Replay introduction" detail="A fresh look at the essentials" onPress={()=>go('intro')}/><SettingsRow icon={MessageSquare} title="Request a feature" detail="Keep an idea for what comes next" onPress={()=>go('feature')}/></SettingsGroup>
      <SettingsGroup title="Your experience"><SettingsRow first icon={LayoutGrid} title="Dashboard" detail="Choose your home controls" onPress={()=>go('dashboard')}/><SettingsRow icon={Smartphone} title="Home screen widget" detail="Preview your daily progress" onPress={()=>go('widget')}/><SettingsRow icon={Bell} title="Notifications" value={settings.notificationsEnabled?'On':'Off'} onPress={()=>go('notifications')}/><SettingsRow icon={Hand} title="Daily pledge reminder" value={settings.pledgeReminderEnabled?settings.pledgeReminderTime||'08:00':'Off'} onPress={()=>go('reminder')}/><SettingsRow icon={Lock} title="App lock" detail="Privacy on your device" onPress={()=>go('lock')}/></SettingsGroup>
      <SettingsGroup title="Help & information"><SettingsRow first icon={ShieldCheck} title="Blocked accounts" onPress={()=>go('blocked')}/><SettingsRow icon={Star} title="Rate your experience" onPress={()=>go('rating')}/><SettingsRow icon={CircleQuestionMark} title="Help center" onPress={()=>go('help')}/><SettingsRow icon={CodeXml} title="Expo React Native source" detail="View native app information" onPress={()=>go('source')}/><SettingsRow icon={ShieldCheck} title="Privacy" onPress={()=>go('privacy')}/><SettingsRow icon={FileText} title="Terms of use" onPress={()=>go('terms')}/></SettingsGroup>
      {redRow('Reset streak counter',()=>{setReason('');go('reset');})}
      <SettingsGroup title="Your device data"><SettingsRow first icon={Download} title="Export a backup" detail="Keep a copy of your journey" onPress={()=>void exportJourney()}/><SettingsRow icon={Upload} title="Restore a backup" detail="Open a previously exported archive" onPress={()=>void chooseBackup()}/></SettingsGroup>
      {redRow('Erase my device data',()=>{setEraseText('');go('erase');},Trash2)}
      <SettingsText align="center" style={{fontSize:10,lineHeight:16,color:p.secondary}}>SobrMate · One day at a time</SettingsText>
    </>}
    {page==='profile'&&<ProfileSettings onBack={()=>go('home')}/>}
    {page==='intro'&&<ReplaySettings onBack={()=>go('home')} onReplay={()=>router.push('/onboarding')}/>}
    {page==='pro'&&<ProSettings onWidget={()=>go('widget')} onPremium={()=>go(premium.isPremium?'membership':'plans')}/>}
    {(page==='plans'||page==='membership'||page==='premium-success')&&<SettingsMembership key={page} screen={page} onNavigate={next=>setPage(next)}/>}
    {page==='dashboard'&&<>
      <SettingsHero icon={LayoutGrid} title="A home that feels yours." description="Keep the controls you need close at hand."/>
      <SettingsCard><SettingsToggle label="Show reset button" description="Display Reset on your home screen." value={settings.showResetButtonOnHome} onChange={value=>updateSettings({showResetButtonOnHome:value})}/></SettingsCard>
      <SettingsNotice icon={Heart}>Your live ticker, daily check-ins and progress are always available. This preference only changes the home Reset shortcut.</SettingsNotice>
      <SettingsText weight="600" style={{fontSize:9,letterSpacing:1.4,color:p.kicker}}>APPEARANCE</SettingsText><SettingsSegments value={settings.theme==='light'?'light':'dark'} options={[{key:'light',label:'Light'},{key:'dark',label:'Dark'}]} onSelect={theme=>updateSettings({theme:theme as 'light'|'dark'})}/>
      <SettingsCard><SettingsToggle label="Haptic feedback" description="A gentle response to your touch." value={settings.hapticFeedback} onChange={value=>updateSettings({hapticFeedback:value})}/></SettingsCard>
    </>}
    {page==='widget'&&(draftsReady?<WidgetSettings preferences={preferences.data} onPremium={()=>go('plans')} onStyle={widgetStyle=>preferences.save(previous=>({...previous,widgetStyle}))}/>:<PreferenceStatus loading={preferences.loading} error={preferences.error} onRetry={preferences.retry}/>)}
    {page==='notifications'&&<>
      <SettingsHero icon={Bell} title="A nudge, on your terms." description="Choose how you would like to stay connected."/>
      <SettingsCard><SettingsToggle label="Notification preference" description="Allow your chosen local reminders." value={settings.notificationsEnabled} onChange={enableNotifications}/></SettingsCard>
      <SettingsCard padded><SettingsText weight="500" style={{fontSize:13,color:p.title,marginBottom:9}}>Device permission</SettingsText><SettingsText style={{alignSelf:'flex-start',fontSize:10,paddingVertical:6,paddingHorizontal:11,borderRadius:30,borderWidth:1,borderColor:p.noticeBorder,backgroundColor:p.soft,color:p.secondaryInk,marginBottom:12}}>{permission===null?'Checking permission…':permission?'Allowed':'Not enabled'}</SettingsText><SettingsText style={{lineHeight:22.2,marginBottom:12}}>Local reminders are scheduled on your device. Permission and your reminder switches must both be enabled.</SettingsText>{!permission&&<SettingsButton label="Request device permission" variant="secondary" onPress={requestPermission}/>}<View style={{marginTop:12}}><SettingsButton label="Open device settings" variant="secondary" onPress={()=>Linking.openSettings()}/></View></SettingsCard>
      {!!permissionError&&<><SettingsNotice error>{permissionError}</SettingsNotice><SettingsButton label="Retry permission check" variant="secondary" onPress={readPermission}/></>}
      <SettingsCard><SettingsToggle label="Daily check-in reminder" description="A quiet moment to reflect on your day." value={settings.dailyReminderEnabled} onChange={value=>updateSettings({dailyReminderEnabled:value})}/></SettingsCard>
      <SettingsLink icon={Clock} label={`Reflection time · ${settings.reminderTime}`} onPress={()=>go('reflection')}/>
      <SettingsLink icon={Clock} label="Daily pledge reminder" onPress={()=>go('reminder')}/>
    </>}
    {(page==='reminder'||page==='reflection')&&<ReminderSettings key={page} kind={page==='reminder'?'pledge':'reflection'}/>}
    {page==='lock'&&<AppLockSettings onPrivacy={()=>go('privacy')}/>}
    {page==='blocked'&&<BlockedSettings onHelp={()=>go('help')}/>}
    {page==='rating'&&(draftsReady?<RatingSettings preferences={preferences.data} onSave={preferences.save}/>:<PreferenceStatus loading={preferences.loading} error={preferences.error} onRetry={preferences.retry}/>)}
    {page==='feature'&&(draftsReady?<FeatureRequestSettings onEdit={()=>scroll.current?.scrollTo({y:0,animated:false})} preferences={preferences.data} onSave={draft=>preferences.save(previous=>saveFeatureDraft(previous,draft))}/>:<PreferenceStatus loading={preferences.loading} error={preferences.error} onRetry={preferences.retry}/>)}
    {page==='help'&&<HelpCenterSettings onFeature={()=>go('feature')}/>}
    {(page==='privacy'||page==='terms')&&<LegalSettings type={page}/>}
    {page==='source'&&<NativeSourceInformation/>}
    {page==='reset'&&<>
      <SettingsHero icon={RotateCcw} title="Begin again, gently." description="A setback is a moment, not the whole journey."/>
      <SettingsCopy sections={[{title:activeHabit?`Reset ${activeHabit.title}?`:'Choose a tracker first',text:activeHabit?'This restarts this tracker’s timer, records a setback with an unknown amount for today, and keeps your earlier history. Today’s existing check-in will be replaced. Your other trackers stay as they are.':'Create or select a tracker from Home to restart its timer.'}]}/>
      {activeHabit&&<><SettingsField label="What triggered this? (optional)" multiline maxLength={1000} value={reason} onChangeText={setReason} placeholder="A thought to reflect on later…" style={{minHeight:104}}/><View style={{flexDirection:'row',gap:10,marginTop:18}}><View style={{flex:1}}><SettingsButton label="Cancel" variant="secondary" onPress={()=>go('home')}/></View><View style={{flex:1}}><SettingsButton label="Reset & restart" variant="danger" onPress={async()=>{await resetHabit(activeHabit.id,reason.trim()||'Temporary setback recorded. Recommitting now.');setPage('home');setMessage('Timer restarted. Earlier history has been kept.');}}/></View></View></>}
    </>}
    {page==='restore'&&<>
      <SettingsHero icon={Download} title="Restore this journey?" description="Bring your saved progress back to this device."/>
      <SettingsCopy sections={[{title:'Review your archive',text:`This archive contains ${backup?.habits.length??0} trackers and ${backup?.checkIns.length??0} check-ins. Restoring replaces the current journey on this device. Your device app lock stays unchanged. Idea and feedback drafts stay separate from the journey backup.`}]}/>
      <SettingsButton label="Cancel" variant="secondary" onPress={()=>{setBackup(null);go('home');}}/><SettingsButton label="Restore backup" disabled={!backup} onPress={async()=>{if(!backup)throw new Error('Choose a backup first.');await restoreBackup(backup);setBackup(null);setPage('home');setMessage('Your journey has been restored.');}}/>
    </>}
    {page==='erase'&&<>
      <SettingsHero icon={Trash2} title="Begin with a clean page?" description="Take a moment before removing your journey."/>
      <SettingsNotice error title="This permanently erases device data">All trackers, check-ins, pledges, preferences and local drafts will be removed. Export a backup first if you want to keep your journey.</SettingsNotice>
      <SettingsField label="Type ERASE to confirm" value={eraseText} onChangeText={setEraseText} autoCapitalize="characters" autoCorrect={false}/>
      <SettingsButton label="Keep my journey" variant="secondary" onPress={()=>go('home')}/>
      <SettingsButton label="Erase all device data" variant="danger" disabled={eraseText!=='ERASE'} onPress={async()=>{await notificationService.cancelAllNotifications();await premium.resetMockAccess();await AsyncStorage.removeItem(SETTINGS_PREFERENCES_KEY);await deleteAccount();await clearPasscode();await auth.releaseWorkspace();await auth.signOut();router.replace('/login');}}/>
    </>}
    {!!error&&<SettingsNotice error>{error}</SettingsNotice>}{!!message&&<SettingsNotice success>{message}</SettingsNotice>}
  </SettingsPanel></SettingsBusyContext.Provider></SettingsOperationContext.Provider></SettingsMotionProvider></View>;
}
function PreferenceStatus({loading,error,onRetry}:{loading:boolean;error:string;onRetry:()=>Promise<void>}) {const p=useSettingsPalette();return loading?<View style={{padding:32,alignItems:'center',gap:12}}><ActivityIndicator color={p.primary}/><SettingsText>Opening your preferences…</SettingsText></View>:<><SettingsNotice error>{error}</SettingsNotice><SettingsButton label="Retry reading preferences" onPress={onRetry}/></>;}
function NativeSourceInformation() {
  const p=useSettingsPalette();
  const text='SobrMate · Native app\nReact Native + Expo + TypeScript\nNavigation: Expo Router\nSettings: app/(tabs)/settings.tsx\nLocal data: src/data/store.tsx\nNotifications: src/utils/notifications.ts\nSecurity: src/utils/security.ts';
  return <><SettingsHero icon={CodeXml} title="Native, from the start." description="This app runs with React Native and Expo."/><SettingsNotice icon={CodeXml}>The reference’s source viewer contains prototype examples. The working source for this app is in your VS Code workspace.</SettingsNotice><SettingsCopy sections={[{title:'Your Settings source',text:'app/(tabs)/settings.tsx\nsrc/components/settings/'},{title:'Expo Go',text:'Tracking, local storage, image sharing and compatible local reminders use Expo native libraries.'},{title:'Development build',text:'Face ID on iOS needs a development build. Home screen widgets need a native extension. Real subscriptions need a configured store billing integration.'}]}/><SettingsButton label="Copy app information" variant="secondary" onPress={async()=>{if(!(await Clipboard.setStringAsync(text)))throw new Error('Clipboard is unavailable. Select and copy the information below.');}}/><SettingsText selectable style={{fontSize:11,lineHeight:19,color:p.secondary}}>{text}</SettingsText></>;
}
