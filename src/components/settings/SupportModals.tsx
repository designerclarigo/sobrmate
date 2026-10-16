import React, { useState } from 'react';
import { Share, View } from 'react-native';
import { Check, ChevronDown, ChevronRight, CircleQuestionMark, Crown, FileText, Heart, Smartphone, Lock, MessageSquare, Play, Search, ShieldCheck, Star, Award } from 'lucide-react-native';
import * as Crypto from 'expo-crypto';
import { usePremium } from '../../data/premium';
import { FeatureDraft, ideaCategories, IdeaCategory, SettingsPreferences } from './settingsPreferences';
import { SettingsButton, SettingsCard, SettingsCopy, SettingsField, SettingsHero, SettingsLink, SettingsNotice, SettingsPressable, SettingsRow, SettingsText, useSettingsPalette } from './SettingsUI';

type LocalPreferences = {preferences:SettingsPreferences;onSave:(change:(previous:SettingsPreferences)=>SettingsPreferences)=>Promise<void>};
export function FeatureRequestSettings({preferences,onSave,onEdit}:{preferences:SettingsPreferences;onSave:(draft:FeatureDraft)=>Promise<void>;onEdit:()=>void}) {
  const p=useSettingsPalette(),[category,setCategory]=useState<IdeaCategory>('Experience'),[expanded,setExpanded]=useState(false);
  const [title,setTitle]=useState(''),[details,setDetails]=useState(''),[id,setId]=useState<string|null>(null),[message,setMessage]=useState('');
  const draft=()=>({id:id||Crypto.randomUUID(),category,title,details});
  return <>
    <SettingsHero icon={MessageSquare} title="Every idea starts small." description="Keep a feature idea as a draft on this device."/>
    <View style={{gap:18}}>
      <View><SettingsText weight="500" style={{fontSize:11,lineHeight:17.6,color:p.secondaryInk,marginBottom:8}}>Category</SettingsText><SettingsPressable accessibilityRole="button" accessibilityLabel={`Category, ${category}`} accessibilityState={{expanded}} onPress={()=>setExpanded(!expanded)} style={{minHeight:48,borderWidth:1,borderColor:p.inputBorder,borderRadius:13,paddingHorizontal:14,paddingVertical:12,backgroundColor:p.surface,flexDirection:'row',alignItems:'center',gap:8}}><SettingsText style={{flex:1,fontSize:13,color:p.title}}>{category}</SettingsText><ChevronDown size={16} color={p.icon}/></SettingsPressable>{expanded&&<View style={{marginTop:8}}><SettingsCard>{ideaCategories.map(item=><SettingsPressable key={item} accessibilityRole="radio" accessibilityLabel={item} accessibilityState={{selected:category===item}} onPress={()=>{setCategory(item);setExpanded(false);}} style={{minHeight:44,paddingHorizontal:14,paddingVertical:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><SettingsText>{item}</SettingsText>{category===item&&<Check size={16} color={p.primary}/>}</SettingsPressable>)}</SettingsCard></View>}</View>
      <SettingsField label="What would you like to see?" placeholder="Give your idea a short title" value={title} onChangeText={setTitle} maxLength={100}/>
      <SettingsField label="Tell us a little more" placeholder="What would help you, and why?" value={details} onChangeText={setDetails} multiline maxLength={2000} style={{minHeight:128}} hint={`${details.length}/2000 · Drafts stay here and are not sent to a team.`}/>
      <SettingsButton label={id?'Update draft':'Save draft'} onPress={async()=>{const idea=draft();await onSave(idea);setId(idea.id);setMessage('Idea saved on this device. It has not been sent.');}}/>
      <SettingsButton label="Open sharing sheet" variant="secondary" disabled={!title.trim()} onPress={async()=>{await Share.share({title:'SobrMate suggestion',message:`SobrMate suggestion · ${category}\n${title.trim()}\n\n${details.trim()}`});}}/>
    </View>
    {!!message&&<SettingsNotice success>{message}</SettingsNotice>}
    {preferences.featureDrafts.length>0&&<><SettingsText weight="600" style={{fontSize:9,letterSpacing:1.4,color:p.kicker}}>YOUR DRAFTS · {preferences.featureDrafts.length}</SettingsText><SettingsCard>{preferences.featureDrafts.map((d,i)=><SettingsRow key={d.id} first={i===0} icon={MessageSquare} title={d.title} detail={d.category} onPress={()=>{setId(d.id);setCategory(d.category);setTitle(d.title);setDetails(d.details);setMessage('Editing saved draft.');onEdit();}}/>)}</SettingsCard><SettingsButton label="Start another idea" variant="secondary" onPress={()=>{setId(null);setCategory('Experience');setTitle('');setDetails('');setMessage('');}}/></>}
  </>;
}
export function RatingSettings({preferences,onSave}:LocalPreferences) {
  const p=useSettingsPalette(),[rating,setRating]=useState(preferences.rating),[feedback,setFeedback]=useState(preferences.feedback),[message,setMessage]=useState('');
  return <>
    <SettingsHero icon={Star} title="How does it feel so far?" description="Your reflection can help shape a better experience."/>
    <View><View accessibilityLabel="Choose a rating" style={{flexDirection:'row',alignSelf:'center',gap:4}}>{[1,2,3,4,5].map(n=><SettingsPressable key={n} accessibilityRole="button" accessibilityLabel={`${n} ${n===1?'star':'stars'}`} accessibilityState={{selected:rating===n}} onPress={()=>setRating(n)} style={{height:48,width:44,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:rating===n?p.goldSoft:'transparent'}}><Star size={29} strokeWidth={1.3} color={p.gold} fill={n<=rating?p.gold:'none'}/></SettingsPressable>)}</View><SettingsText align="center" style={{fontSize:11,color:p.gold,marginTop:10,marginBottom:24}}>{rating?`${rating} of 5 stars`:'Choose your rating'}</SettingsText>
      <SettingsField label="A little more (optional)" value={feedback} onChangeText={setFeedback} maxLength={1000} multiline placeholder="What feels good? What could be better?" style={{minHeight:128}} hint="A local feedback draft. App store reviews are not connected."/>
      <View style={{marginTop:16}}><SettingsButton label="Save feedback draft" onPress={async()=>{if(rating<1)throw new Error('Choose a rating before saving your feedback.');await onSave(previous=>({...previous,rating,feedback:feedback.trim()}));setMessage('Feedback draft saved on this device. It has not been posted or sent.');}}/></View>
    </View>
    {!!message&&<SettingsNotice success>{message}</SettingsNotice>}
  </>;
}
export const helpArticles=[
  {q:'How do I switch or add a tracker?',a:'Tap the tracker name in the top bar. Choose an existing tracker or Add a tracker. Each tracker has its own calendar, check-ins and progress.'},
  {q:'How do daily check-ins work?',a:'Tap a calendar date or a day on Home. Enter the amount, choose a status and add an optional note. Save to update that tracker’s calendar and recorded statistics.'},
  {q:'What do the calendar colors mean?',a:'For alcohol: 0 drinks is green, 1–2 yellow, 3–5 orange, 6+ red and blackout charcoal. Other habits use their own units and rules. Open Tracking rules on Calendar. Unrecorded days are left empty.'},
  {q:'Can I edit or restore an entry?',a:'Tap a recorded date in Calendar to update its quantity, status or note. To recover a saved journey, use Restore a backup in Settings. This replaces the current journey with the archive; it does not merge individual entries. An amount that was never recorded stays unknown.'},
  {q:'How are milestones calculated?',a:'Milestones use the current tracker’s timer start. Today’s setback can restart the timer. Tap a milestone for its goal and target date; earned milestones can be shared.'},
  {q:'Where is my progress stored?',a:'Trackers, check-ins, pledges and preferences are saved on this device. There is no cloud backup or account sync. Export a backup before uninstalling or moving to another phone. Settings idea and feedback drafts stay on this device separately.'},
  {q:'Will reminders arrive when the app is closed?',a:'Enable Notifications and the reminder you want, then choose its local time. The native app schedules local reminders. Device permissions, focus modes and battery settings can delay delivery. Native widgets and remote push require additional native integration.'},
  {q:'What happens when I reset the timer?',a:'Reset starts this tracker’s timer again and records a setback for today with an unknown amount and your optional reflection. It keeps earlier history and your best streak, but replaces today’s check-in.'},
];
export function HelpCenterSettings({onFeature}:{onFeature:()=>void}) {
  const p=useSettingsPalette(),[search,setSearch]=useState(''),[open,setOpen]=useState<string|null>(null),articles=helpArticles.filter(a=>(a.q+' '+a.a).toLowerCase().includes(search.trim().toLowerCase()));
  return <>
    <SettingsHero icon={CircleQuestionMark} title="A little clarity helps." description="Find your way, one question at a time."/>
    <View><Search size={18} color={p.icon} style={{position:'absolute',left:14,top:15,zIndex:1}}/><SettingsField accessibilityLabel="Search help articles" placeholder="Search questions" value={search} onChangeText={setSearch} autoCorrect={false} style={{paddingLeft:42}}/></View>
    {articles.length>0?<SettingsCard>{articles.map((article,i)=><View key={article.q} style={{borderTopWidth:i?1:0,borderColor:p.noticeBorder}}><SettingsPressable onPress={()=>setOpen(open===article.q?null:article.q)} accessibilityRole="button" accessibilityLabel={article.q} accessibilityState={{expanded:open===article.q}} style={{minHeight:62,padding:16,flexDirection:'row',alignItems:'center',gap:10}}><SettingsText style={{flex:1,fontSize:12,lineHeight:19.8,color:p.secondaryInk}}>{article.q}</SettingsText><ChevronDown size={17} color={p.icon} style={{transform:[{rotate:open===article.q?'180deg':'0deg'}]}}/></SettingsPressable>{open===article.q&&<SettingsText style={{fontSize:12,lineHeight:22.2,paddingHorizontal:18,paddingBottom:20}}>{article.a}</SettingsText>}</View>)}</SettingsCard>:<SettingsText style={{fontSize:11,lineHeight:19.25}}>No matching questions. Try “calendar”, “tracker” or “reminder”.</SettingsText>}
    <SettingsLink icon={MessageSquare} label="Keep a feature idea" onPress={onFeature}/>
  </>;
}
export function LegalSettings({type}:{type:'privacy'|'terms'}) {
  const privacy=type==='privacy';
  return <>
    <SettingsHero icon={privacy?ShieldCheck:FileText} eyebrow="App information" title={privacy?'Know where things live.':'A few things to know.'} description={privacy?'A plain-language guide to your data.':'Context for your personal tracking journey.'}/>
    <SettingsCopy sections={privacy?[
      {title:'Your account & authentication',text:'Production sign-in uses Supabase and requires a verified email address. Development Demo Mode uses a clearly labeled local test account and a separate workspace; it does not verify an email or contact Supabase. Remember me saves session state in native encrypted storage. When unchecked, sessions last until the app runtime restarts. Passwords are not saved in session storage.'},
      {title:'Stored on this device',text:'Trackers, quantities, notes, recovery questionnaire answers, pledges and preferences stay in device app storage. Signing in does not upload or sync these records. No cloud backup, analytics or advertising is configured.'},
      {title:'Permission is your choice',text:'Notification permission is requested when you enable notifications or choose Request device permission. Local reminders depend on operating system settings. PIN credentials are hashed and saved in native secure storage.'},
      {title:'Local drafts',text:'Feature ideas and feedback drafts are stored separately on this device. Saving a draft does not send it to a support team or post a review. Open sharing sheet only prepares a suggestion for a destination you choose.'},
      {title:'Your data & your device',text:'The first verified account is linked to this device’s local journey. Signing out keeps the journey and restricts access to that account. Exported backups include private records and questionnaire answers; store them carefully. App lock does not encrypt backups. Erase device data removes records and the device account link; it does not delete your Supabase account.'},
      {title:'Before a public release',text:'This describes the current app implementation. Published privacy information and service details will require appropriate review before a public release.'},
    ]:[
      {title:'A personal tracking tool',text:'SobrMate helps you record habits and reflect on progress. Calendar colors are visual categories, not medical guidance or a measure of health or safety. The app provides no medical diagnosis or treatment.'},
      {title:'Your account, your data',text:'Production requires a configured Supabase email/password account with verified email. Email domains are not restricted. Development Demo Mode accepts only its documented test account and is unavailable in release runtimes. There is no sign-up screen. Tracking records stay on this device; back them up before uninstalling. Local reminders depend on device permissions and operating system behavior.'},
      {title:'Your entries, your decisions',text:'Check entries before saving. Editing a tracker or logging a setback can change statistics and milestone dates. Reset keeps previous history but replaces today’s entry. Savings are estimates based on values you enter.'},
      {title:'Mock Premium access',text:'Premium uses development mock mode. No charges, real purchases, automatic renewals or store restoration are configured. Widgets are design previews until a native widget extension is installed.'},
      {title:'Before a public release',text:'This is app information, not a finalized legal agreement. Published terms, service details and appropriate review are needed before a public release.'},
    ]}/>
  </>;
}
export function ProSettings({onWidget,onPremium}:{onWidget:()=>void;onPremium:()=>void}) {
  const p=useSettingsPalette(),premium=usePremium();
  return <>
    <SettingsHero icon={Crown} eyebrow="A thoughtful next chapter" title="More room to grow." description="An early look at the Pro experience, designed around your journey."/>
    <SettingsCard>{[
      {icon:Award,title:'Deeper reflections',description:'Advanced statistics for a little more perspective.'},
      {icon:Smartphone,title:'Progress at a glance',description:'Year calendars and native widget design previews.'},
      {icon:ShieldCheck,title:'A more personal space',description:'Additional sharing templates. App security stays free.'},
    ].map((item,i)=><View key={item.title} style={{flexDirection:'row',gap:12,padding:18,borderTopWidth:i?1:0,borderColor:p.divider}}><item.icon size={20} color={p.icon} style={{marginTop:2}}/><View style={{flex:1}}><SettingsText weight="500" style={{color:p.noticeTitle}}>{item.title}</SettingsText><SettingsText style={{fontSize:11,lineHeight:18.7,marginTop:4}}>{item.description}</SettingsText></View></View>)}</SettingsCard>
    <SettingsNotice icon={Crown} title="Development mock mode">Subscriptions and billing are not connected. Mock plans are saved on this device, without charges or store contact.</SettingsNotice>
    <SettingsButton label="Preview a widget" onPress={onWidget} icon={<ChevronRight size={16} color={p.inverse}/>}/>
    <SettingsButton label={premium.isPremium?'Manage mock membership':'Explore mock plans'} variant="secondary" onPress={onPremium}/>
  </>;
}
export function ReplaySettings({onReplay,onBack}:{onReplay:()=>void;onBack:()=>void}) {
  const p=useSettingsPalette();return <>
    <SettingsHero icon={Play} eyebrow="Back to the beginning" title="A gentle refresher." description="Explore the introduction again at your own pace."/>
    <SettingsCopy sections={[{title:'Your progress stays with you',text:'Replaying the introduction keeps your existing trackers, check-ins and pledges. If you choose to create a tracker, it is added alongside your current ones.'}]}/>
    <SettingsButton label="Replay introduction" onPress={onReplay} icon={<Play size={17} color={p.inverse}/>}/><SettingsButton label="Keep exploring Settings" variant="secondary" onPress={onBack}/>
  </>;
}
export function BlockedSettings({onHelp}:{onHelp:()=>void}) {const p=useSettingsPalette();return <>
  <SettingsHero icon={ShieldCheck} title="Nothing to manage here." description="There are no social accounts to block."/>
  <View style={{paddingVertical:32,paddingHorizontal:22,borderRadius:23,borderWidth:1,borderColor:p.border,backgroundColor:p.surface,alignItems:'center'}}><ShieldCheck size={36} color={p.icon} strokeWidth={1.2} style={{marginBottom:18}}/><SettingsText serif align="center" style={{fontSize:22,lineHeight:30.8,color:p.secondaryInk,marginBottom:14}}>A quiet, personal space.</SettingsText><SettingsText align="center" style={{fontSize:12,lineHeight:22.2}}>Your trackers are personal to this device. SobrMate has no Community, social accounts or blocking service.</SettingsText></View>
  <SettingsButton label="Visit Help center" variant="secondary" onPress={onHelp}/>
</>;}
