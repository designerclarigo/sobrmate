import React, { useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';
import { ChevronDown, Clock, Hand } from 'lucide-react-native';
import { useRecoveryStore } from '../../data/store';
import { reminderTime } from './settingsPreferences';
import { SettingsButton, SettingsCard, SettingsField, SettingsHero, SettingsNotice, SettingsPressable, SettingsText, SettingsToggle, useSettingsPalette } from './SettingsUI';

export function ReminderSettings({kind='pledge'}:{kind?:'reflection'|'pledge'}) {
  const {settings,updateSettings}=useRecoveryStore();
  const initial=kind==='pledge'?settings.pledgeReminderTime||'08:00':settings.reminderTime;
  const p=useSettingsPalette();
  const [hour,setHour]=useState(initial.split(':')[0]),[minute,setMinute]=useState(initial.split(':')[1]),[message,setMessage]=useState(''),[selecting,setSelecting]=useState<'hour'|'minute'|null>(null);
  const pledge=kind==='pledge',enabled=pledge?settings.pledgeReminderEnabled:settings.dailyReminderEnabled;
  return <>
    <SettingsHero icon={pledge?Hand:Clock} title={pledge?'Make a moment for you.':'A moment to reflect.'} description={pledge?'Choose a time to pause and renew your daily pledge.':'Choose a quiet moment for your daily check-in.'}/>
    <SettingsCard><SettingsToggle label={pledge?'Daily pledge reminder':'Daily check-in reminder'} description="A gentle reminder at your chosen local time." value={enabled} onChange={value=>updateSettings(pledge?{pledgeReminderEnabled:value}:{dailyReminderEnabled:value})}/></SettingsCard>
    <View>
      <SettingsText weight="500" style={{fontSize:11,lineHeight:17.6,marginBottom:8}}>Your preferred time · 24-hour clock</SettingsText>
      <View style={{flexDirection:'row',alignItems:'flex-end',gap:12}}>{(['hour','minute'] as const).map((part,i)=><React.Fragment key={part}>{i===1&&<SettingsText style={{height:48,paddingTop:12}}>:</SettingsText>}<View style={{flex:1}}><SettingsText style={{fontSize:10,lineHeight:16,marginBottom:7}}>{part==='hour'?'Hour':'Minute'}</SettingsText><View><SettingsField accessibilityLabel={`Reminder ${part}`} keyboardType="number-pad" selectTextOnFocus maxLength={2} value={part==='hour'?hour:minute} onChangeText={part==='hour'?setHour:setMinute} onFocus={()=>setSelecting(null)} style={{paddingRight:44}}/><View style={{position:'absolute',right:0,top:0}}><SettingsPressable accessibilityRole="button" accessibilityLabel={`Choose reminder ${part}`} accessibilityState={{expanded:selecting===part}} onPress={()=>{Keyboard.dismiss();setSelecting(selecting===part?null:part);}} style={{width:44,height:48,alignItems:'center',justifyContent:'center'}}><ChevronDown size={16} color={p.secondary}/></SettingsPressable></View></View></View></React.Fragment>)}</View>
      {selecting&&<View style={{marginTop:8}}><SettingsCard><ScrollView nestedScrollEnabled style={{maxHeight:192}} keyboardShouldPersistTaps="handled">{Array.from({length:selecting==='hour'?24:60},(_,i)=>String(i).padStart(2,'0')).map(value=><SettingsPressable key={value} accessibilityRole="button" accessibilityLabel={`${selecting} ${value}`} accessibilityState={{selected:(selecting==='hour'?hour:minute)===value}} onPress={()=>{(selecting==='hour'?setHour:setMinute)(value);setSelecting(null);}} style={{minHeight:44,paddingVertical:12,paddingHorizontal:14,backgroundColor:(selecting==='hour'?hour:minute)===value?p.notice:p.surface}}><SettingsText style={{fontSize:13,color:p.inputInk}}>{value}</SettingsText></SettingsPressable>)}</ScrollView></SettingsCard></View>}
      <SettingsText style={{fontSize:11,lineHeight:19.25,marginTop:8,marginBottom:16}}>Local time · {hour||'—'}:{minute||'—'}{enabled?' each day':' · reminder is off'}</SettingsText>
      <SettingsButton label="Save reminder time" onPress={async()=>{const time=reminderTime(hour,minute);await updateSettings(pledge?{pledgeReminderTime:time}:{reminderTime:time});setHour(time.split(':')[0]);setMinute(time.split(':')[1]);setMessage('Reminder time saved on this device.');}}/>
    </View>
    {!!message&&<SettingsNotice success>{message}</SettingsNotice>}
    <SettingsNotice icon={Clock}>{settings.notificationsEnabled?'Your device schedules local reminders when notifications and this reminder are enabled. Focus modes and battery settings can delay delivery.':'Turn on Notifications in Settings to receive this reminder. Saving a time alone does not enable notification permission.'}</SettingsNotice>
  </>;
}
