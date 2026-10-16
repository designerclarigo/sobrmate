import React,{useEffect,useState} from 'react';
import {ActivityIndicator,KeyboardAvoidingView,Platform,Pressable,ScrollView,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ArrowLeft,ShieldCheck} from 'lucide-react-native';
import {useRouter} from 'expo-router';
import * as Linking from 'expo-linking';
import {Button,Input,Text,useTheme} from '../design-system';
import {BrandMark} from '../onboarding/OnboardingIllustration';
import {useAuth} from './AuthProvider';
import {DEMO_ACCOUNT} from './demo';

function AuthScaffold({title,subtitle,eyebrow='YOUR PRIVATE SPACE',children,onBack}:{title:string;subtitle:string;eyebrow?:string;children:React.ReactNode;onBack?:()=>void}) {
  const {colors:c}=useTheme();return <SafeAreaView style={{flex:1,backgroundColor:c.background.canvas}}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}><ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{flexGrow:1,padding:24,paddingBottom:32,width:'100%',maxWidth:438,alignSelf:'center'}} showsVerticalScrollIndicator={false}>
    <View style={{flexDirection:'row',alignItems:'center',gap:9,marginBottom:38}}>{onBack&&<Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to sign in" style={{height:44,width:44,alignItems:'center',justifyContent:'center',marginLeft:-12}}><ArrowLeft size={21} color={c.text.secondary}/></Pressable>}<BrandMark size={33}/><Text weight="500" style={{fontSize:16}}>SobrMate</Text></View>
    <View style={{gap:12,marginBottom:28}}><View style={{alignSelf:'flex-start',height:52,width:52,borderRadius:18,alignItems:'center',justifyContent:'center',backgroundColor:c.accent.primaryLight,marginBottom:8}}><ShieldCheck size={26} strokeWidth={1.5} color={c.accent.primary}/></View><Text variant="subcaption" color="accent" style={{letterSpacing:1.5}}>{eyebrow}</Text><Text serif variant="display" accessibilityRole="header" style={{fontSize:34,lineHeight:40}}>{title}</Text><Text color="secondary">{subtitle}</Text></View>
    {children}
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
function Notice({children,error=false}:{children:React.ReactNode;error?:boolean}) {const {colors:c}=useTheme();return <View accessibilityRole={error?'alert':undefined} accessibilityLiveRegion="polite" style={{padding:16,borderWidth:1,borderColor:error?c.accent.roseBorder:c.border.subtle,backgroundColor:error?c.accent.roseLight:c.background.subtle,borderRadius:18}}><Text variant="caption" color={error?'rose':'secondary'}>{children}</Text></View>;}
function SetupNotice(){const auth=useAuth();return !auth.configured?<Notice>Sign-in is not configured in this build. Your existing device records have not been changed.{__DEV__?`\n\n${auth.configurationError}\nSee docs/AUTHENTICATION.md.`:''}</Notice>:null;}
export function ForgotPasswordScreen() {
  const auth=useAuth(),router=useRouter();const [email,setEmail]=useState(''),[error,setError]=useState(''),[sent,setSent]=useState(false),[cooldown,setCooldown]=useState(0);
  useEffect(()=>{if(!cooldown)return;const timer=setTimeout(()=>setCooldown(value=>Math.max(0,value-1)),1000);return()=>clearTimeout(timer);},[cooldown]);
  if(auth.mode==='demo')return <AuthScaffold title="Your demo space." subtitle="Demo authentication uses a fixed local test account." onBack={()=>router.replace('/login')}><View style={{gap:20}}><Notice>No reset email is sent in Demo Mode. Use {DEMO_ACCOUNT.email} with password {DEMO_ACCOUNT.password}. Supabase password reset is available in Supabase mode.</Notice><Button label="Back to sign in" onPress={()=>router.replace('/login')}/></View></AuthScaffold>;
  return <AuthScaffold title="A gentle way back." subtitle="We’ll email a secure link to reset your password." onBack={()=>router.replace('/login')}><View style={{gap:20}}><SetupNotice/>{sent&&<Notice>If an account matches this email, a reset link has been requested. Open it on this device in the installed app. Check your spam folder, too.</Notice>}<Input label="Email address" value={email} onChangeText={setEmail} editable={!auth.busy} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" maxLength={254} placeholder="you@example.com"/>{!!error&&<Notice error>{error}</Notice>}
    {!auth.supportsRedirect&&<Notice>Password reset return links need an installed development or production build. Expo Go cannot receive this app’s custom return link.</Notice>}
    <Button label={cooldown?`Send again in ${cooldown}s`:sent?'Send another reset link':'Send reset link'} size="lg" loading={auth.busy} disabled={!auth.configured||!auth.supportsRedirect||cooldown>0} onPress={async()=>{setError('');try{await auth.requestPasswordReset(email);setSent(true);setCooldown(60);}catch(e){setError(e instanceof Error?e.message:'Unable to request a reset link.');}}}/><Button label="Back to sign in" variant="ghost" disabled={auth.busy} onPress={()=>router.replace('/login')}/></View></AuthScaffold>;
}
export function ResetPasswordScreen() {
  const auth=useAuth(),router=useRouter();const [password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[error,setError]=useState('');
  return <AuthScaffold title="A new key to your space." subtitle={`Choose a strong password for ${auth.user?.email||'your account'}.`}><View style={{gap:20}}><Input label="New password" secureTextEntry value={password} onChangeText={setPassword} editable={!auth.busy} maxLength={128} autoComplete="new-password" textContentType="newPassword" autoCapitalize="none" helperText="Use 12–128 characters. A long, unique passphrase works well."/><Input label="Confirm new password" secureTextEntry value={confirmation} onChangeText={setConfirmation} editable={!auth.busy} maxLength={128} autoCapitalize="none"/>{!!error&&<Notice error>{error}</Notice>}<Button label="Update password & sign out" size="lg" loading={auth.busy} disabled={auth.status!=='recovery'} onPress={async()=>{setError('');try{await auth.completePasswordReset(password,confirmation);setPassword('');setConfirmation('');router.replace('/login');}catch(e){setError(e instanceof Error?e.message:'Unable to update your password.');}}}/><Button label="Cancel & sign out" disabled={auth.busy} variant="ghost" onPress={async()=>{await auth.signOut();router.replace('/login');}}/></View></AuthScaffold>;
}
export function AuthCallbackScreen() {
  const auth=useAuth(),url=Linking.useURL(),router=useRouter();const [error,setError]=useState(''),[done,setDone]=useState(false);
  useEffect(()=>{if(!url)return;let active=true;void auth.handleCallback(url).then(()=>{if(active)setDone(true);}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Unable to finish authentication.');});return()=>{active=false;};},[url,auth.handleCallback]);
  useEffect(()=>{if(done&&auth.status==='recovery')router.replace('/auth/reset-password');else if(done&&auth.status==='authenticated')router.replace('/');else if(done&&(auth.status==='conflict'||auth.status==='error'))router.replace('/login');},[done,auth.status,router]);
  return <AuthScaffold title="Returning to your journey." subtitle="Securely verifying your sign-in link."><View style={{gap:24}}>{error?<Notice error>{error}</Notice>:<ActivityIndicator accessibilityLabel="Verifying authentication"/>}{(!url||!!error)&&<Button label={auth.status==='authenticated'?'Return to my journey':'Back to sign in'} variant="outline" onPress={()=>router.replace('/')}/>}</View></AuthScaffold>;
}
