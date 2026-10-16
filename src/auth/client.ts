import './nativeCrypto';
import 'react-native-url-polyfill/auto';
import {createClient,processLock} from '@supabase/supabase-js';
import {authStorage} from './secureStorage';
import {authConfig,authenticationMode} from './runtime';
export {authConfig} from './runtime';
import {authFetch} from './request';
import {createSessionStorage} from './sessionStorage';
const sessionKey=authConfig.ready?`sb-${new URL(authConfig.url).hostname.split('.')[0]}-auth-token`:'';
export const sessionStorage=authenticationMode==='supabase'&&authConfig.ready?createSessionStorage(authStorage,sessionKey):null;
export const authClient=authenticationMode==='supabase'&&authConfig.ready?createClient(authConfig.url,authConfig.key,{
  auth:{storage:sessionStorage!,storageKey:sessionKey,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,flowType:'pkce',lock:processLock},
  global:{fetch:authFetch(fetch)},
}):null;
