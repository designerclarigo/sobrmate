import type {SecretStore} from './chunkedStorage';
import {createSessionStorage} from './sessionStorage';
import {loginCredentials} from './authPolicy';

export const DEMO_ACCOUNT={email:'demo@komorebi.app',password:'KomorebiDemo2026!',id:'local-demo-account-v1'} as const;
export interface AuthIdentity {id:string;email?:string;source:'demo'|'supabase'}
function demoError(code:string,message:string){return Object.assign(new Error(message),{code});}

/** Deliberate local demo authentication, not a Supabase user, JWT or verified email. */
export function createDemoAuth(secure:SecretStore,enabled:boolean){
  const key='demo-email-session-v1',storage=createSessionStorage(secure,key,'remember-demo-session');
  const assertEnabled=()=>{if(!enabled)throw demoError('demo_unavailable','Demo authentication is unavailable in this runtime.');};
  const identity=():AuthIdentity=>({id:DEMO_ACCOUNT.id,email:DEMO_ACCOUNT.email,source:'demo'});
  return {
    async restore(){
      assertEnabled();const remember=await storage.getRememberMe(),raw=await storage.getItem(key);
      if(!raw)return {user:null,remember};
      let value;try{value=JSON.parse(raw);}catch{throw new Error('The demo session could not be read. Sign in again.');}
      if(value?.version!==1||value.mode!=='demo'||value.accountId!==DEMO_ACCOUNT.id)throw new Error('The demo session is invalid. Sign in again.');
      return {user:identity(),remember};
    },
    async signIn(email:string,password:string,remember:boolean){
      assertEnabled();const credentials=loginCredentials(email,password);
      if(credentials.email!==DEMO_ACCOUNT.email||credentials.password!==DEMO_ACCOUNT.password)throw demoError('demo_invalid_credentials','Use the demo email and password shown on the sign-in screen.');
      await storage.setRememberMe(remember);
      await storage.setItem(key,JSON.stringify({version:1,mode:'demo',accountId:DEMO_ACCOUNT.id}));
      return identity();
    },
    async signOut(){assertEnabled();await storage.removeItem(key);},
  };
}
