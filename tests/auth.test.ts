import {test} from 'node:test';
import assert from 'node:assert/strict';
import {AUTH_REDIRECT,authConfiguration,callbackCode,loginCredentials,newPassword,redirectFor,AuthAttempt} from '../src/auth/authPolicy';
import {createChunkedStorage,SecretStore} from '../src/auth/chunkedStorage';
import {createClient,processLock} from '@supabase/supabase-js';
import {authFetch} from '../src/auth/request';

const attempt:AuthAttempt={id:'c9cc52f4-578b-455c-a687-e4fa27228f7f',intent:'login',createdAt:1000};
const callback=(change?: (url:URL)=>void)=>{const url=new URL(redirectFor(attempt));url.searchParams.set('code','one-time-code');change?.(url);return url.toString();};

test('auth transport preserves request data, bounds network waits, and respects cancellation',async()=>{
  const bounded=authFetch(async(input,options)=>{assert.equal(String(input),'https://project.supabase.co/auth/v1/token');assert.equal(options?.body,'request-body');return new Response('{}');});
  assert.equal((await bounded('https://project.supabase.co/auth/v1/token',{method:'POST',body:'request-body'})).status,200);
  const hanging:typeof fetch=async(_input,options)=>new Promise((_resolve,reject)=>{if(options?.signal?.aborted)reject(new Error('aborted'));else options?.signal?.addEventListener('abort',()=>reject(new Error('aborted')),{once:true});});
  await assert.rejects(authFetch(hanging,10)('https://project.supabase.co'),/timed out/);
  const controller=new AbortController();controller.abort();await assert.rejects(authFetch(hanging)('https://project.supabase.co',{signal:controller.signal}),/aborted/);
});

test('auth configuration only accepts HTTPS and a public publishable key',()=>{
  assert.equal(authConfiguration('https://project.supabase.co','sb_publishable_1234567890abcdef').ready,true);
  for(const [url,key] of [[undefined,undefined],['https://YOUR_PROJECT.supabase.co','sb_publishable_REPLACE_WITH_KEY'],['http://project.supabase.co','sb_publishable_1234567890abcdef'],['https://secret@project.supabase.co','sb_publishable_1234567890abcdef'],['https://project.supabase.co?token=secret','sb_publishable_1234567890abcdef'],['https://project.supabase.co','sb_secret_1234567890abcdef'],['https://project.supabase.co','eyJhbGciOiJIUzI1NiJ9']])assert.equal(authConfiguration(url,key).ready,false);
});
test('credentials normalize email without changing a password and reset enforces a matching passphrase',()=>{
  assert.deepEqual(loginCredentials('  TEST@example.com ',' pass phrase '),{email:'test@example.com',password:' pass phrase '});
  for(const email of ['','missing@domain','has space@example.com'])assert.throws(()=>loginCredentials(email,'password'));
  assert.throws(()=>loginCredentials('valid@example.com',''));
  assert.equal(newPassword('a secure passphrase','a secure passphrase'),'a secure passphrase');
  assert.throws(()=>newPassword('short','short'));assert.throws(()=>newPassword('a secure passphrase','different password'));
});
test('callback validates origin, same-device intent, nonce, expiry, and one-time code',()=>{
  assert.deepEqual(callbackCode(callback(),attempt,2000),{code:'one-time-code',intent:'login'});
  assert.throws(()=>callbackCode(callback().replace('komorebi:','https:'),attempt,2000));
  for(const change of [
    (u:URL)=>{u.host='auth:123';},(u:URL)=>{u.host='other';},(u:URL)=>{u.pathname='/other';},
    (u:URL)=>{u.hash='access_token=secret';},(u:URL)=>{u.searchParams.set('flow_id','other');},(u:URL)=>{u.searchParams.set('intent','recovery');},
    (u:URL)=>{u.searchParams.append('flow_id',attempt.id);},(u:URL)=>{u.searchParams.append('code','second');},
    (u:URL)=>{u.searchParams.delete('code');},(u:URL)=>{u.searchParams.set('access_token','implicit');},(u:URL)=>{u.searchParams.set('error','access_denied');},
  ])assert.throws(()=>callbackCode(callback(change),attempt,2000));
  assert.throws(()=>callbackCode(callback(),null,2000));
  assert.throws(()=>callbackCode(callback(),attempt,999));assert.throws(()=>callbackCode(callback(),attempt,3601001));
});
test('password recovery and Supabase multi-flow verifier IDs remain separate from login',()=>{
  const recovery={...attempt,intent:'recovery' as const},url=new URL(redirectFor(recovery));url.searchParams.set('code','reset-code');url.searchParams.set('sb_flow_id','flow-id-1234');
  assert.deepEqual(callbackCode(url.toString(),recovery,2000),{code:'reset-code',intent:'recovery',flowId:'flow-id-1234'});
  url.searchParams.set('sb_flow_id','../../bad');assert.throws(()=>callbackCode(url.toString(),recovery,2000));
});

function memoryStorage(){
  const values=new Map<string,string>();let generation=0,fail:(key:string)=>boolean=()=>false;
  const store:SecretStore={getItem:async key=>values.get(key)??null,setItem:async(key,value)=>{if(fail(key))throw new Error('Keychain unavailable');values.set(key,value);},removeItem:async key=>{values.delete(key);}};
  return {values,storage:createChunkedStorage(store,()=>`generation-${++generation}`),setFailure:(value:typeof fail)=>{fail=value;}};
}
test('secure session chunking round-trips large Unicode payloads under native per-item limits',async()=>{
  const {values,storage}=memoryStorage(),session=JSON.stringify({token:'a'.repeat(7000),name:'日本語 🌱 é'.repeat(400)});
  await storage.setItem('session',session);assert.equal(await storage.getItem('session'),session);
  for(const value of values.values()){assert.ok(Buffer.byteLength(value,'utf8')<=1600);assert.match(value,/^[\x00-\x7f]*$/);}
  assert.ok(values.size>4);assert.equal(await storage.getItem('missing'),null);
});
test('failed secure-storage writes preserve the prior session and clean incomplete generations',async()=>{
  const {values,storage,setFailure}=memoryStorage();await storage.setItem('session','original');
  setFailure(key=>key.endsWith('generation-2.1'));await assert.rejects(storage.setItem('session','replacement'.repeat(1000)),/Keychain/);
  assert.equal(await storage.getItem('session'),'original');assert.equal([...values.keys()].some(key=>key.includes('generation-2')),false);
  setFailure(key=>key==='sobrmate.auth.session');await assert.rejects(storage.setItem('session','uncommitted'),/Keychain/);assert.equal(await storage.getItem('session'),'original');
  setFailure(()=>false);await storage.setItem('session','final');assert.equal(await storage.getItem('session'),'final');assert.equal([...values.keys()].some(key=>key.includes('generation-1')),false);
});
test('secure storage serializes overlapping operations and deletion removes credentials',async()=>{
  const {values,storage}=memoryStorage();await Promise.all([storage.setItem('session','first'),storage.setItem('session','second')]);assert.equal(await storage.getItem('session'),'second');
  await storage.removeItem('session');assert.equal(await storage.getItem('session'),null);assert.equal(values.size,0);
  await assert.rejects(storage.setItem('../unsafe','value'),/Invalid secure storage key/);await storage.setItem('session','queue recovers');assert.equal(await storage.getItem('session'),'queue recovers');
});
test('corrupted or incomplete secure storage fails closed without echoing credential contents',async()=>{
  const {values,storage}=memoryStorage();await storage.setItem('session','secret-token');values.set('sobrmate.auth.session.generation-1.0','private-credential-fragment');
  await assert.rejects(storage.getItem('session'),error=>error instanceof Error&&error.message==='Invalid secure session. Please sign in again.');
  values.delete('sobrmate.auth.session.generation-1.0');await assert.rejects(storage.getItem('session'),/incomplete/);
  values.set('sobrmate.auth.session','token-fragment');await assert.rejects(storage.getItem('session'),/could not be read/);
});

// Transport fixtures exercise the installed Supabase SDK; these are not live identity-provider tests.
function sdkHarness(respond:(url:URL,init?:RequestInit)=>Response){
  const {storage}=memoryStorage();const requests:{url:URL;init?:RequestInit}[]=[];
  const client=createClient('https://project.supabase.co','sb_publishable_1234567890abcdef',{auth:{storage,persistSession:true,autoRefreshToken:false,detectSessionInUrl:false,flowType:'pkce',lock:processLock},global:{fetch:async(input,init)=>{const url=new URL(String(input));requests.push({url,init});return respond(url,init);}}});
  return {client,storage,requests};
}
test('email login sends the password only in the HTTPS request body and rejects server failures',async()=>{
  const {client,requests,storage}=sdkHarness(()=>new Response(JSON.stringify({error_code:'invalid_credentials',msg:'Invalid login credentials'}),{status:400,headers:{'Content-Type':'application/json'}}));
  const {data,error}=await client.auth.signInWithPassword(loginCredentials(' Person@example.com ','secret-passphrase'));
  assert.equal(data.session,null);assert.ok(error);assert.equal(requests[0].url.pathname,'/auth/v1/token');assert.equal(requests[0].url.searchParams.get('grant_type'),'password');assert.equal(requests[0].url.search.includes('secret'),false);const body=JSON.parse(String(requests[0].init?.body));assert.equal(body.email,'person@example.com');assert.equal(body.password,'secret-passphrase');assert.equal(await storage.getItem('sb-project-auth-token'),null);
});
test('password-reset SDK requests carry S256 and same-device recovery metadata',async()=>{
  const {client,requests}=sdkHarness(()=>new Response('{}',{status:200,headers:{'Content-Type':'application/json'}}));const recovery={...attempt,intent:'recovery' as const};
  const {error}=await client.auth.resetPasswordForEmail('person@example.com',{redirectTo:redirectFor(recovery)});assert.equal(error,null);
  const request=requests[0],body=JSON.parse(String(request.init?.body));assert.equal(request.url.pathname,'/auth/v1/recover');assert.equal(body.email,'person@example.com');assert.equal(body.code_challenge_method,'s256');assert.ok(body.code_challenge);const redirect=new URL(request.url.searchParams.get('redirect_to')!);assert.equal(redirect.searchParams.get('intent'),'recovery');assert.equal(redirect.searchParams.get('flow_id'),attempt.id);
});
test('PKCE exchanges the stored verifier once, persists the session, and verifies identity with the server',async()=>{
  const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'person@example.com',email_confirmed_at:'2026-01-01T00:00:00Z',created_at:'2026-01-01T00:00:00Z',app_metadata:{provider:'email'},user_metadata:{},identities:[]};
  const jwt=['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'test-signature'].join('.');
  const {client,requests,storage}=sdkHarness(url=>new Response(JSON.stringify(url.pathname.endsWith('/user')?user:{access_token:jwt,refresh_token:'test-refresh-token',expires_in:3600,token_type:'bearer',user}),{status:200,headers:{'Content-Type':'application/json'}}));
  await client.auth.resetPasswordForEmail('person@example.com',{redirectTo:redirectFor({...attempt,intent:'recovery'})});
  const redirect=new URL(requests[0].url.searchParams.get('redirect_to')!),flowId=redirect.searchParams.get('sb_flow_id');
  const result=await client.auth.exchangeCodeForSession('test-one-time-code',flowId?{flowId}:undefined);assert.equal(result.error,null);assert.equal(result.data.session?.user.id,user.id);
  const tokenRequest=requests.find(r=>r.url.searchParams.get('grant_type')==='pkce')!;assert.ok(tokenRequest);const body=JSON.parse(String(tokenRequest.init?.body));assert.equal(body.auth_code,'test-one-time-code');assert.ok(body.code_verifier.length>=43);
  assert.ok(await storage.getItem('sb-project-auth-token'));
  const verified=await client.auth.getUser(result.data.session!.access_token);assert.equal(verified.error,null);assert.equal(verified.data.user?.email_confirmed_at,user.email_confirmed_at);assert.equal(requests.at(-1)?.url.pathname,'/auth/v1/user');
  const replay=await client.auth.exchangeCodeForSession('test-one-time-code',flowId?{flowId}:undefined);assert.ok(replay.error);assert.equal(requests.filter(r=>r.url.searchParams.get('grant_type')==='pkce').length,1);
  await client.auth.signOut({scope:'local'});assert.equal((await client.auth.getSession()).data.session,null);assert.equal(await storage.getItem('sb-project-auth-token'),null);
});
