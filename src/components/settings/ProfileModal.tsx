import React, { useState } from 'react';
import { View } from 'react-native';
import { ShieldCheck, User } from 'lucide-react-native';
import { useRecoveryStore } from '../../data/store';
import { validateProfile } from './settingsPreferences';
import { useAuth } from '../../auth/AuthProvider';
import { SettingsButton, SettingsField, SettingsHero, SettingsNotice, SettingsText, useSettingsPalette } from './SettingsUI';

export function ProfileSettings({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings } = useRecoveryStore(), p=useSettingsPalette();
  const auth=useAuth();
  const [name,setName]=useState(settings.userName),[bio,setBio]=useState(settings.userBio),[email,setEmail]=useState(settings.userEmail),[message,setMessage]=useState('');
  return <>
    <View style={{width:72,height:72,borderRadius:26,backgroundColor:p.widgetEnd,alignSelf:'center',alignItems:'center',justifyContent:'center',marginBottom:-20}}><SettingsText serif style={{fontSize:30,lineHeight:36,color:p.icon}}>{name.trim().slice(0,1).toUpperCase()||'S'}</SettingsText></View>
    <SettingsHero icon={User} hideIcon title="Your journey, your name." description="A personal touch for this device."/>
    <View style={{gap:18}}>
      <SettingsField label="Display name" value={name} onChangeText={setName} maxLength={60} autoCapitalize="words" autoComplete="nickname" hint="1–60 characters. Only stored on this device."/>
      <SettingsField label="A little about your journey" value={bio} onChangeText={setBio} multiline maxLength={500} style={{minHeight:104}}/>
      <SettingsField label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={254}/>
      <View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><SettingsButton label="Cancel" variant="secondary" onPress={onBack}/></View><View style={{flex:1}}><SettingsButton label="Save profile" onPress={async()=>{const profile=validateProfile(name,email);await updateSettings({...profile,userBio:bio.trim()});setMessage('Profile saved on this device.');}}/></View></View>
    </View>
    {!!message&&<SettingsNotice success>{message}</SettingsNotice>}
    <SettingsNotice icon={ShieldCheck} title={auth.mode==='demo'?'Development demo account':'Your signed-in account'}>{auth.user?.email||'Signed in'} · {auth.mode==='demo'?'Local demo, not a verified Supabase account.':'Supabase Auth.'} Profile fields above are stored locally and do not change your login email. Tracker data is not uploaded or synced.</SettingsNotice>
    <SettingsButton label="Sign out" variant="secondary" onPress={auth.signOut}/>
  </>;
}
