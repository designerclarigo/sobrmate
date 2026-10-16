import React,{createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {AppState} from 'react-native';
import * as Linking from 'expo-linking';
import Constants,{ExecutionEnvironment} from 'expo-constants';
import * as Crypto from 'expo-crypto';
import type {Session} from '@supabase/supabase-js';
import {authClient,authConfig,sessionStorage} from './client';
import {authenticationMode,isDevelopmentRuntime} from './runtime';
import {AuthIdentity,createDemoAuth} from './demo';
import {AUTH_ATTEMPT_KEY,AUTH_RECOVERY_KEY,authStorage,LOCAL_OWNER_KEY} from './secureStorage';
import {AUTH_REDIRECT,AuthAttempt,AuthIntent,callbackCode,emailAddress,loginCredentials,newPassword,redirectFor,requireVerifiedEmail,signInErrorMessage} from './authPolicy';

const demoAuth=createDemoAuth(authStorage,isDevelopmentRuntime&&authenticationMode==='demo');
type Status='loading'|'signed-out'|'authenticated'|'recovery'|'conflict'|'error';
interface AuthState {status:Status;user:AuthIdentity|null;mode:'demo'|'supabase';error:string;notice:string;busy:boolean;rememberMe:boolean;configured:boolean;supportsRedirect:boolean;configurationError:string;signIn:(email:string,password:string,remember?:boolean)=>Promise<void>;requestPasswordReset:(email:string)=>Promise<void>;completePasswordReset:(password:string,confirm:string)=>Promise<void>;handleCallback:(url:string)=>Promise<void>;signOut:()=>Promise<void>;retry:()=>Promise<void>;releaseWorkspace:()=>Promise<void>}
const Context=createContext<AuthState|null>(null);
const supportsRedirect=Constants.executionEnvironment!==ExecutionEnvironment.StoreClient&&authenticationMode==='supabase';
export function AuthProvider({children}:{children:React.ReactNode}) {
  const [status,setStatus]=useState<Status>('loading'),[user,setUser]=useState<AuthIdentity|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[rememberMe,setRememberMe]=useState(true);
  const revision=useRef(0),pending=useRef(false),recovery=useRef(false),mounted=useRef(true),callbacks=useRef(new Map<string,Promise<void>>());
  const client=()=>{if(!authClient)throw Object.assign(new Error('Connect your Supabase project to enable secure sign-in.'),{code:'auth_not_configured'});return authClient;};
  const publish=useCallback(async(session:Session|null)=>{
    const run=++revision.current;
    if(!session){if(mounted.current){setUser(null);setStatus('signed-out');}return;}
    try{
      // Stored tokens are never accepted as proof of identity without server verification.
      const {data,error}=await client().auth.getUser(session.access_token);
      if(error)throw error;
      requireVerifiedEmail(session.user.id,data.user);
      if(!data.user)throw new Error('Your session could not be verified.');
      if(run!==revision.current||!mounted.current)return;
      if(!recovery.current){
        const owner=await authStorage.getItem(LOCAL_OWNER_KEY);
        if(run!==revision.current||!mounted.current)return;
        if(owner&&owner!==data.user.id){setUser({id:data.user.id,email:data.user.email,source:'supabase'});setStatus('conflict');setError('This device’s local journey belongs to another account. Sign in with the original account. Your records have not been changed.');return;}
        if(!owner)await authStorage.setItem(LOCAL_OWNER_KEY,data.user.id);
      }
      if(run!==revision.current||!mounted.current)return;
      setUser({id:data.user.id,email:data.user.email,source:'supabase'});setError('');setStatus(recovery.current?'recovery':'authenticated');
    }catch(e){if(run===revision.current&&mounted.current){setUser(null);setStatus('error');setError(e instanceof Error&&e.message.startsWith('Verify your email address')?e.message:signInErrorMessage(e));}}
  },[]);
  const retry=useCallback(async()=>{
    setStatus('loading');setError('');
    try{
      if(authenticationMode==='demo'){
        const saved=await demoAuth.restore();if(mounted.current){setUser(saved.user);setRememberMe(saved.remember);setStatus(saved.user?'authenticated':'signed-out');}return;
      }
      if(!authClient){setUser(null);setStatus('signed-out');return;}
      if(sessionStorage)setRememberMe(await sessionStorage.getRememberMe());
      recovery.current=!!(await authStorage.getItem(AUTH_RECOVERY_KEY));
      const {data,error}=await authClient.auth.getSession();if(error)throw error;await publish(data.session);
    }catch(e){if(mounted.current){setStatus('error');setError(signInErrorMessage(e));}}
  },[publish]);
  const run=async<T,>(action:()=>Promise<T>):Promise<T>=>{if(pending.current)throw new Error('Please wait for the current sign-in action.');pending.current=true;setBusy(true);setError('');setNotice('');try{return await action();}finally{pending.current=false;if(mounted.current)setBusy(false);}};
  const begin=async(intent:AuthIntent)=>{if(typeof TextEncoder==='undefined'||typeof globalThis.crypto?.subtle?.digest!=='function')throw new Error('Secure PKCE is unavailable on this runtime. Use an updated development build.');if(!supportsRedirect)throw new Error('Use an installed development or production build for secure authentication return links.');const attempt:AuthAttempt={id:Crypto.randomUUID(),intent,createdAt:Date.now()};await authStorage.setItem(AUTH_ATTEMPT_KEY,JSON.stringify(attempt));return attempt;};
  const handleCallback=useCallback((url:string):Promise<void>=>{
    const previous=callbacks.current.get(url);if(previous)return previous;
    const work=(async()=>{
      if(authenticationMode==='demo')throw new Error('Password-reset links belong to Supabase mode. Demo uses its documented fixed account.');
      const raw=await authStorage.getItem(AUTH_ATTEMPT_KEY),attempt:AuthAttempt|null=raw?JSON.parse(raw):null;
      const result=callbackCode(url,attempt);
      recovery.current=result.intent==='recovery';
      if(recovery.current)await authStorage.setItem(AUTH_RECOVERY_KEY,'pending');
      const {data,error}=await client().auth.exchangeCodeForSession(result.code,result.flowId?{flowId:result.flowId}:undefined);if(error)throw error;
      if(!data.session)throw new Error('The provider did not create a session. Please sign in again.');
      await authStorage.removeItem(AUTH_ATTEMPT_KEY);
      await publish(data.session);
    })();
    callbacks.current.set(url,work);if(callbacks.current.size>4)callbacks.current.delete(callbacks.current.keys().next().value!);
    return work;
  },[publish]);
  useEffect(()=>{
    mounted.current=true;void retry();if(!authClient)return()=>{mounted.current=false;++revision.current;};
    // Supabase callbacks must return immediately: awaiting another auth API here can deadlock its lock.
    const {data:{subscription}}=authClient.auth.onAuthStateChange((event,session)=>{
      if(event==='PASSWORD_RECOVERY')recovery.current=true;
      if(event==='SIGNED_OUT'){recovery.current=false;++revision.current;if(mounted.current){setUser(null);setStatus('signed-out');}return;}
      if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED'||event==='USER_UPDATED'||event==='PASSWORD_RECOVERY'){
        const eventRevision=revision.current;
        setTimeout(()=>{if(mounted.current&&eventRevision===revision.current)void publish(session);},0);
      }
    });
    const refresh=(state:string)=>{if(state==='active')void authClient!.auth.startAutoRefresh().catch(()=>undefined);else void authClient!.auth.stopAutoRefresh().catch(()=>undefined);};
    refresh(AppState.currentState);const app=AppState.addEventListener('change',refresh);
    const links=Linking.addEventListener('url',event=>{if(event.url.startsWith(AUTH_REDIRECT))void handleCallback(event.url).catch(e=>{if(mounted.current)setError(e instanceof Error?e.message:'Unable to open this authentication link.');});});
    return()=>{mounted.current=false;++revision.current;subscription.unsubscribe();app.remove();links.remove();void authClient!.auth.stopAutoRefresh();};
  },[retry,publish,handleCallback]);
  const signOut=()=>run(async()=>{if(authenticationMode==='demo'){await demoAuth.signOut();++revision.current;setUser(null);setStatus('signed-out');return;}const {error}=await client().auth.signOut({scope:'local'});if(error)throw error;recovery.current=false;await authStorage.removeItem(AUTH_ATTEMPT_KEY);await authStorage.removeItem(AUTH_RECOVERY_KEY);++revision.current;setUser(null);setStatus('signed-out');});
  const value:AuthState={status,user,mode:authenticationMode,error,notice,busy,rememberMe,configured:authConfig.ready,supportsRedirect,configurationError:authConfig.ready?'':authConfig.error,retry,handleCallback,signOut,
    signIn:(email,password,remember=true)=>run(async()=>{if(authenticationMode==='demo'){const identity=await demoAuth.signIn(email,password,remember);++revision.current;setRememberMe(remember);setUser(identity);setStatus('authenticated');return;}const credentials=loginCredentials(email,password);const api=client();await sessionStorage!.setRememberMe(remember);setRememberMe(remember);recovery.current=false;await authStorage.removeItem(AUTH_RECOVERY_KEY);const {data,error}=await api.auth.signInWithPassword(credentials);if(error)throw error;if(!data.session)throw new Error('No verified session was returned.');await publish(data.session);}),
    requestPasswordReset:email=>run(async()=>{if(authenticationMode==='demo')throw new Error('Demo mode uses the documented fixed password. No reset email is sent.');const normalized=emailAddress(email),attempt=await begin('recovery');const {error}=await client().auth.resetPasswordForEmail(normalized,{redirectTo:redirectFor(attempt)});if(error)throw error;}),
    completePasswordReset:(password,confirm)=>run(async()=>{if(!recovery.current||status!=='recovery')throw new Error('Open a valid password-reset email on this device first.');const {error}=await client().auth.updateUser({password:newPassword(password,confirm)});if(error)throw error;const result=await client().auth.signOut({scope:'local'});if(result.error)throw result.error;recovery.current=false;await authStorage.removeItem(AUTH_RECOVERY_KEY);setUser(null);setStatus('signed-out');setNotice('Your password was updated. Sign in with your new password.');}),
    releaseWorkspace:async()=>{if(authenticationMode==='demo')return;const owner=await authStorage.getItem(LOCAL_OWNER_KEY);if(!user||owner!==user.id)throw new Error('Sign in with this device’s account first.');await authStorage.removeItem(LOCAL_OWNER_KEY);},
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth(){const value=useContext(Context);if(!value)throw new Error('AuthProvider is missing.');return value;}
