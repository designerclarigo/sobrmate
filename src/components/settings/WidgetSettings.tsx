import React from 'react';
import { View } from 'react-native';
import { Crown, Smartphone, Sprout } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRecoveryStore } from '../../data/store';
import { usePremium } from '../../data/premium';
import { SettingsButton, SettingsCard, SettingsHero, SettingsNotice, SettingsSegments, SettingsText, SettingsToggle, useSettingsPalette } from './SettingsUI';
import { SettingsPreferences } from './settingsPreferences';

export function WidgetSettings({preferences,onStyle,onPremium}:{preferences:SettingsPreferences;onPremium:()=>void;onStyle:(style:'minimal'|'detailed')=>Promise<void>}) {
  const p=useSettingsPalette(),{activeHabit,settings,updateSettings,cleanTime}=useRecoveryStore('day'),premium=usePremium(),enabled=premium.canAccess('home_widgets');
  return <>
    <SettingsHero icon={Smartphone} eyebrow="A small daily reminder" title="Your progress, in view." description="Preview a widget for your current tracker."/>
    <LinearGradient colors={[p.widget,p.widgetEnd]} start={{x:0,y:0}} end={{x:1,y:1}} style={{borderWidth:1,borderColor:p.widgetBorder,borderRadius:27,padding:24}}>
      <View style={{flexDirection:'row',alignItems:'center',gap:7}}><Sprout size={18} color={p.widgetInk}/><SettingsText weight="500" style={{fontSize:10,lineHeight:16,color:p.widgetInk}}>SobrMate</SettingsText></View>
      <View style={{flexDirection:'row',alignItems:'baseline',gap:10,marginTop:24,marginBottom:16}}><SettingsText serif style={{fontSize:50,lineHeight:55,color:p.widgetInk}}>{activeHabit?cleanTime.days:'—'}</SettingsText><SettingsText style={{fontSize:11,lineHeight:17.6,maxWidth:90,color:p.icon}}>{cleanTime.days===1?'day':'days'} of progress</SettingsText></View>
      <SettingsText weight="500" style={{color:p.widgetInk}}>{activeHabit?.title||'Your next chapter'}</SettingsText>
      {preferences.widgetStyle==='detailed'&&<SettingsText style={{fontSize:11,lineHeight:17.6,marginTop:16,paddingTop:12,borderTopWidth:1,borderColor:p.widgetBorder,color:p.icon}}>{cleanTime.hours}h · {cleanTime.minutes}m · One day at a time</SettingsText>}
    </LinearGradient>
    <SettingsSegments value={preferences.widgetStyle} options={[{key:'minimal',label:'Minimal'},{key:'detailed',label:'Detailed'}]} onSelect={value=>onStyle(value as 'minimal'|'detailed')}/>
    <SettingsNotice icon={Smartphone} title="Native app feature">This is an in-app preview. An installed native widget extension and a development build are required for a home screen widget. Expo Go cannot install one.</SettingsNotice>
    <SettingsCard><SettingsToggle label="Save widget preference" description={enabled?'Save your preference for the future native widget.':'Widget configuration is a mock Premium feature.'} value={settings.widgetConfigured} disabled={!enabled} onChange={value=>updateSettings({widgetConfigured:value})}/></SettingsCard>
    {!enabled&&<SettingsButton label="Explore mock Premium" icon={<Crown size={17} color={p.inverse}/>} onPress={onPremium}/>}
  </>;
}
