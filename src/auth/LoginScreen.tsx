import React,{useEffect,useRef,useState} from 'react';
import {Animated,Easing,Keyboard,KeyboardAvoidingView,Platform,Pressable,ScrollView,StyleSheet,Text as NativeText,TextInput,View,useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {Check,Eye,EyeOff,LockKeyhole,Mail,ShieldCheck} from 'lucide-react-native';
import {Button,Modal,Text,useTheme} from '../design-system';
import {NativeTextInput} from '../design-system/components/NativeInput';
import {BrandMark} from '../onboarding/OnboardingIllustration';
import {LegalSettings} from '../components/settings/SupportModals';
import {useReducedMotion} from '../utils/useReducedMotion';
import {triggerHaptic} from '../utils/haptics';
import {useAuth} from './AuthProvider';
import {DEMO_ACCOUNT} from './demo';
import {emailAddress,signInErrorMessage} from './authPolicy';

/** Email-only native login. Private-route guards and Supabase verification live in AuthProvider. */
export function LoginScreen(){
  const auth=useAuth(),router=useRouter(),{colors:c,isDark}=useTheme();
  const {height,fontScale}=useWindowDimensions(),reducedMotion=useReducedMotion();
  const compact=height/Math.max(1,fontScale)<740;
  const [email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [visible,setVisible]=useState(false),[remember,setRemember]=useState(auth.rememberMe);
  const [focused,setFocused]=useState<'email'|'password'|null>(null);
  const [errors,setErrors]=useState<{email?:string;password?:string}>({});
  const [formError,setFormError]=useState(''),[submitting,setSubmitting]=useState(false);
  const [legal,setLegal]=useState<'privacy'|'terms'|null>(null);
  const emailRef=useRef<TextInput>(null),passwordRef=useRef<TextInput>(null);
  const pending=useRef(false),mounted=useRef(true),entrance=useRef(new Animated.Value(0)).current;
  const busy=auth.busy||submitting;
  const shownError=formError||auth.error;

  useEffect(()=>{
    mounted.current=true;
    if(reducedMotion){entrance.setValue(1);return()=>{mounted.current=false;};}
    const animation=Animated.timing(entrance,{toValue:1,duration:360,easing:Easing.out(Easing.cubic),useNativeDriver:true,isInteraction:false});
    animation.start();return()=>{mounted.current=false;animation.stop();};
  },[entrance,reducedMotion]);

  const submit=async()=>{
    if(pending.current||busy)return;
    const next:{email?:string;password?:string}={};
    try{emailAddress(email);}catch{next.email='Enter a valid email address.';}
    if(!password)next.password='Enter your password.';
    setErrors(next);setFormError('');
    if(next.email){emailRef.current?.focus();return;}
    if(next.password){passwordRef.current?.focus();return;}
    Keyboard.dismiss();pending.current=true;setSubmitting(true);
    try{await auth.signIn(email,password,remember);}
    catch(error){if(mounted.current)setFormError(signInErrorMessage(error));}
    finally{pending.current=false;if(mounted.current){setPassword('');setSubmitting(false);}}
  };

  const fieldColor=(field:'email'|'password')=>errors[field]?c.accent.rose:focused===field?c.accent.primary:c.border.subtle;
  const errorText=(field:'email'|'password')=>errors[field]?<Text nativeID={`login-${field}-error`} accessibilityRole="alert" accessibilityLiveRegion="polite" variant="caption" style={{color:c.accent.rose,marginTop:8}}>{errors[field]}</Text>:null;

  return <SafeAreaView style={[styles.safe,{backgroundColor:c.background.canvas}]}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS==='ios'?'padding':'height'}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS==='ios'?'interactive':'on-drag'} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.brandRow}>
          <BrandMark size={36}/><Text weight="500" style={styles.brandName}>SobrMate</Text>
          <ShieldCheck size={19} strokeWidth={1.4} color={c.accent.primary} style={styles.brandShield} accessible={false}/>
        </View>

        <Animated.View style={[styles.main,{paddingTop:compact?28:48,paddingBottom:compact?24:40,opacity:entrance,transform:[{translateY:entrance.interpolate({inputRange:[0,1],outputRange:[10,0]})}]}]}>
          <View style={[styles.introduction,{marginBottom:compact?28:36}]}>
            <View style={styles.eyebrowRow}><View style={[styles.eyebrowRule,{backgroundColor:c.accent.primary}]}/><Text variant="subcaption" color="accent" style={styles.eyebrow}>ONE DAY AT A TIME</Text></View>
            <NativeText accessibilityRole="header" style={[styles.title,{color:c.text.primary,fontFamily:Platform.OS==='ios'?'Georgia':'serif'}]}>Welcome back.</NativeText>
            <Text color="secondary" style={styles.subtitle}>A quiet space to reconnect with your journey.</Text>
          </View>

          <View style={styles.form}>
            {auth.mode==='demo'&&<View style={[styles.notice,{backgroundColor:c.accent.champagneLight,borderColor:c.accent.amberBorder}]}><Text weight="500" style={styles.noticeTitle}>Development demo · local only</Text><Text variant="caption">Use {DEMO_ACCOUNT.email} with password {DEMO_ACCOUNT.password}</Text><Text variant="caption" color="secondary">A separate test workspace. No Supabase account or email verification is used.</Text></View>}
            {auth.mode==='supabase'&&!auth.configured&&<View style={[styles.notice,{backgroundColor:c.background.surface,borderColor:c.border.subtle}]}>
              <Text weight="500" style={styles.noticeTitle}>Sign-in is being set up.</Text>
              <Text variant="caption" color="secondary">Your device records are safe. The account service needs to be connected before you can sign in.</Text>
              {__DEV__&&<Text variant="caption" color="secondary">Add the public Supabase settings from .env.example, restart Expo, and follow docs/AUTHENTICATION.md.</Text>}
            </View>}
            {!!shownError&&<View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.notice,{backgroundColor:c.accent.roseLight,borderColor:c.accent.roseBorder}]}>
              <Text weight="500" style={styles.noticeTitle}>{auth.status==='conflict'?'Your journey is protected.':'Let’s try that again.'}</Text>
              <Text variant="caption" style={{color:isDark?c.accent.rose:c.text.primary}}>{shownError}</Text>
            </View>}
            {!!auth.notice&&<View accessibilityLiveRegion="polite" style={[styles.notice,{backgroundColor:c.accent.successLight,borderColor:c.accent.successBorder}]}><Text variant="caption">{auth.notice}</Text></View>}

            {auth.status==='conflict'&&<Button label="Sign in with the original account" size="lg" fullWidth loading={busy} onPress={async()=>{setFormError('');try{await auth.signOut();}catch(error){setFormError(signInErrorMessage(error));}}}/>}
            <>
              <View>
                <Text weight="500" style={styles.label}>Email Address</Text>
                <View style={[styles.field,{backgroundColor:c.background.surface,borderColor:fieldColor('email')}]}>
                  <Mail size={19} strokeWidth={1.5} color={focused==='email'?c.accent.primary:c.text.tertiary} accessible={false}/>
                  <NativeTextInput ref={emailRef} value={email} onChangeText={value=>{setEmail(value);setErrors(previous=>({...previous,email:undefined}));setFormError('');}} onFocus={()=>setFocused('email')} onBlur={()=>{setFocused(null);if(email.trim()){try{emailAddress(email);}catch{setErrors(previous=>({...previous,email:'Enter a valid email address.'}));}}}} accessibilityLabel="Email Address" accessibilityHint={errors.email||'Enter the email address for your existing account.'} keyboardType="email-address" autoComplete="email" textContentType="username" importantForAutofill="yes" autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={254} underlineColorAndroid="transparent" placeholder="you@example.com" returnKeyType="next" submitBehavior="submit" onSubmitEditing={()=>passwordRef.current?.focus()} editable={!busy} style={styles.input}/>
                </View>
                {errorText('email')}
              </View>

              <View>
                <Text weight="500" style={styles.label}>Password</Text>
                <View style={[styles.field,{backgroundColor:c.background.surface,borderColor:fieldColor('password')}]}>
                  <LockKeyhole size={19} strokeWidth={1.5} color={focused==='password'?c.accent.primary:c.text.tertiary} accessible={false}/>
                  <NativeTextInput ref={passwordRef} value={password} onChangeText={value=>{setPassword(value);setErrors(previous=>({...previous,password:undefined}));setFormError('');}} onFocus={()=>setFocused('password')} onBlur={()=>setFocused(null)} accessibilityLabel="Password" accessibilityHint={errors.password||'Enter your account password.'} secureTextEntry={!visible} autoComplete="current-password" textContentType="password" importantForAutofill="yes" autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={4096} underlineColorAndroid="transparent" placeholder="Enter your password" returnKeyType="go" submitBehavior="submit" onSubmitEditing={()=>void submit()} editable={!busy} style={styles.input}/>
                  <Pressable onPress={()=>setVisible(previous=>!previous)} disabled={busy} accessibilityRole="button" accessibilityLabel={visible?'Hide password':'Show password'} accessibilityState={{disabled:busy}} hitSlop={2} style={({pressed})=>[styles.visibility,{opacity:pressed?0.5:1}]}>
                    {visible?<EyeOff size={20} strokeWidth={1.5} color={c.text.secondary}/>:<Eye size={20} strokeWidth={1.5} color={c.text.secondary}/>}
                  </Pressable>
                </View>
                {errorText('password')}
              </View>

              <View style={styles.preferences}>
                <View style={styles.preferenceRow}>
                  <Pressable onPress={()=>{setRemember(previous=>!previous);triggerHaptic('selection');}} disabled={busy} accessibilityRole="checkbox" accessibilityLabel="Remember me" accessibilityHint="Keep your session in encrypted storage between app launches." accessibilityState={{checked:remember,disabled:busy}} style={({pressed})=>[styles.remember,{opacity:busy?0.5:pressed?0.65:1}]}>
                    <View style={[styles.checkbox,{borderColor:remember?c.accent.primary:c.border.medium,backgroundColor:remember?c.accent.primary:c.background.surface}]}>{remember&&<Check size={13} strokeWidth={2} color={c.text.inverse}/>}</View>
                    <Text style={styles.preferenceText}>Remember me</Text>
                  </Pressable>
                  <Pressable onPress={()=>router.push('/forgot-password')} disabled={busy} accessibilityRole="button" accessibilityLabel="Forgot Password" accessibilityState={{disabled:busy}} style={({pressed})=>[styles.forgot,{opacity:busy?0.5:pressed?0.55:1}]}><Text color="accent" weight="500" style={styles.preferenceText}>Forgot Password?</Text></Pressable>
                </View>
                <Text variant="caption" color="secondary" style={styles.rememberHint}>{remember?'Stay signed in securely on this device.':'Sign in again when the app restarts.'}</Text>
              </View>

              <Button label="Sign In" size="lg" fullWidth loading={busy} keepEnabledWhileLoading onPress={submit} style={{borderRadius:18,minHeight:56,shadowColor:c.accent.primary,shadowOffset:{width:0,height:6},shadowOpacity:isDark?0:0.16,shadowRadius:14,elevation:2}} labelStyle={{fontSize:16,letterSpacing:0.1}}/>
              {auth.status==='error'&&auth.configured&&<Button label="Retry saved session" variant="ghost" disabled={busy} onPress={async()=>{setFormError('');await auth.retry();}}/>}
            </>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.privacyNote}><LockKeyhole size={14} strokeWidth={1.5} color={c.text.tertiary} accessible={false}/><Text variant="caption" color="secondary" style={styles.privacyText}>Your reflections stay on this device.</Text></View>
          <View style={styles.legalRow}>{(['privacy','terms'] as const).map(type=><Pressable key={type} onPress={()=>setLegal(type)} accessibilityRole="button" accessibilityLabel={type==='privacy'?'Privacy information':'Terms of use'} style={({pressed})=>[styles.legalLink,{opacity:pressed?0.5:1}]}><Text variant="caption" color="secondary">{type==='privacy'?'Privacy':'Terms of use'}</Text></Pressable>)}</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    <Modal visible={!!legal} onClose={()=>setLegal(null)} title={legal==='privacy'?'Privacy':'Terms of use'}>
      <LegalSettings type={legal||'privacy'}/><View style={{marginTop:24}}><Button label="Close" variant="outline" onPress={()=>setLegal(null)}/></View>
    </Modal>
  </SafeAreaView>;
}

const styles=StyleSheet.create({
  flex:{flex:1},
  safe:{flex:1},
  scroll:{flexGrow:1,width:'100%',maxWidth:438,alignSelf:'center',paddingHorizontal:24,paddingTop:16,paddingBottom:12},
  brandRow:{flexDirection:'row',alignItems:'center',gap:10,minHeight:44},
  brandName:{fontSize:16,lineHeight:24,letterSpacing:-0.4},
  brandShield:{marginLeft:'auto'},
  main:{flexGrow:1,justifyContent:'center'},
  introduction:{gap:14},
  eyebrowRow:{flexDirection:'row',alignItems:'center',gap:10},
  eyebrowRule:{width:20,height:1},
  eyebrow:{fontSize:12,lineHeight:18,letterSpacing:1.6,flexShrink:1},
  title:{fontSize:38,lineHeight:46,letterSpacing:-1.1,fontWeight:'400',includeFontPadding:false},
  subtitle:{fontSize:15,lineHeight:24,maxWidth:300},
  form:{gap:24},
  label:{fontSize:14,lineHeight:22,marginBottom:10},
  field:{minHeight:58,borderRadius:17,borderWidth:1,paddingHorizontal:16,flexDirection:'row',alignItems:'center',gap:12},
  input:{flex:1,minWidth:0,minHeight:56,paddingVertical:16,fontSize:16,lineHeight:24},
  visibility:{minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center',marginRight:-8},
  preferences:{gap:2,marginTop:-12},
  preferenceRow:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',columnGap:16},
  remember:{flexDirection:'row',alignItems:'center',gap:10,minHeight:44,flexShrink:1},
  checkbox:{width:20,height:20,borderWidth:1,borderRadius:6,alignItems:'center',justifyContent:'center'},
  preferenceText:{fontSize:14,lineHeight:22,flexShrink:1},
  forgot:{minHeight:44,justifyContent:'center',flexShrink:1},
  rememberHint:{fontSize:13,lineHeight:20},
  notice:{borderWidth:1,borderRadius:18,padding:18,gap:8},
  noticeTitle:{fontSize:15,lineHeight:22},
  footer:{gap:4},
  privacyNote:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7},
  privacyText:{flexShrink:1,textAlign:'center'},
  legalRow:{flexDirection:'row',justifyContent:'center',gap:24},
  legalLink:{minHeight:44,justifyContent:'center',paddingHorizontal:8},
});
