import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Lock, ShieldCheck } from 'lucide-react-native';
import { useRecoveryStore } from '../../data/store';
import { hasPasscode, savePasscode, clearPasscode, verifyPasscode } from '../../utils/security';
import { localAuthService } from '../../utils/localAuth';
import { SettingsButton, SettingsCard, SettingsCopy, SettingsField, SettingsHero, SettingsLink, SettingsNotice, SettingsToggle, useSettingsPalette } from './SettingsUI';

export function AppLockSettings({onPrivacy}:{onPrivacy:()=>void}) {
  const {settings,updateSettings}=useRecoveryStore(),p=useSettingsPalette();
  const [enabled,setEnabled]=useState(settings.appLockEnabled),[biometric,setBiometric]=useState(settings.biometricEnabled),[supported,setSupported]=useState(false),[existing,setExisting]=useState(false),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState('');
  const [current,setCurrent]=useState(''),[pin,setPin]=useState(''),[confirm,setConfirm]=useState(''),[message,setMessage]=useState('');
  const loaded=useRef(false);
  useEffect(()=>{let mounted=true;void Promise.all([hasPasscode(),localAuthService.checkBiometricsSupport()]).then(([has,status])=>{if(mounted){setExisting(has);setSupported(status.isEnrolled&&status.isHardwareAvailable);loaded.current=true;}}).catch(()=>{if(mounted)setLoadError('Unable to read security settings. Close this screen and try again.');}).finally(()=>{if(mounted)setLoading(false);});return()=>{mounted=false;};},[]);
  const save=async()=>{
    if(!loaded.current)throw new Error('Security settings have not loaded. Please try again.');
    if(settings.appLockEnabled&&!(await verifyPasscode(current)))throw new Error('Your current PIN did not match.');
    if(enabled&&(!existing||pin)){
      if(!/^\d{4}$/.test(pin))throw new Error('Choose a four-digit PIN.');
      if(pin!==confirm)throw new Error('Your new PINs do not match.');
      await savePasscode(pin);
      if(settings.appLockEnabled)setCurrent(pin);
    }
    // If persistence fails after creating a PIN, allow retry without requiring a new one.
    if(enabled&&(!existing||pin))setExisting(true);
    await updateSettings({appLockEnabled:enabled,biometricEnabled:enabled&&supported&&biometric,pinCode:undefined});
    if(!enabled)await clearPasscode();
    setPin('');setConfirm('');setCurrent('');setMessage('App lock preferences saved.');
  };
  return <>
    <SettingsHero icon={Lock} eyebrow="Your personal space" title="Privacy, with intention." description="Protect the device where you keep your journey."/>
    {loading?<ActivityIndicator color={p.primary}/>:loadError?<SettingsNotice error>{loadError}</SettingsNotice>:<>
      <SettingsCard><SettingsToggle label="Native app lock" description="Require your four-digit PIN when you return." value={enabled} onChange={setEnabled}/></SettingsCard>
      {settings.appLockEnabled&&<SettingsField label="Current PIN" value={current} onChangeText={setCurrent} secureTextEntry keyboardType="number-pad" maxLength={4}/>}
      {enabled&&<View style={{gap:18}}><SettingsField label={existing?'New PIN (optional)':'Choose a four-digit PIN'} value={pin} onChangeText={setPin} secureTextEntry keyboardType="number-pad" maxLength={4}/><SettingsField label="Confirm new PIN" value={confirm} onChangeText={setConfirm} secureTextEntry keyboardType="number-pad" maxLength={4}/><SettingsCard><SettingsToggle label="Allow biometrics" description={supported?'Use your enrolled device biometrics.':'Enroll biometrics in your device settings to enable this.'} value={supported&&biometric} disabled={!supported} onChange={setBiometric}/></SettingsCard></View>}
      <SettingsButton label="Save app lock" onPress={save}/>
    </>}
    {!!message&&<SettingsNotice success>{message}</SettingsNotice>}
    <SettingsCopy sections={[{title:'Your device, your private space',text:'PIN credentials are hashed and held in native secure storage. Keep your device screen lock enabled. Biometric availability depends on your device; Face ID requires an iOS development build.'}]}/>
    <SettingsLink icon={ShieldCheck} label="Read privacy information" onPress={onPrivacy}/>
  </>;
}
