import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createClient,processLock} from '@supabase/supabase-js';
import {emailAddress,loginCredentials,requireVerifiedEmail,signInErrorMessage} from '../src/auth/authPolicy';
import {createSessionStorage} from '../src/auth/sessionStorage';
import type {SecretStore} from '../src/auth/chunkedStorage';

const key='sb-project-auth-token';
function secureFixture(){
  const values=new Map<string,string>();let failDeletion=false;
  const storage:SecretStore={getItem:async key=>values.get(key)??null,setItem:async(key,value)=>{values.set(key,value);},removeItem:async key=>{if(failDeletion)throw new Error('Keychain unavailable');values.delete(key);}};
  return {values,storage,setDeletionFailure:(value:boolean)=>{failDeletion=value;}};
}

test('email login accepts common providers and custom domains without a domain allowlist',()=>{
  for(const email of ['person@gmail.com','person@outlook.com','person@hotmail.com','person@yahoo.com','person@icloud.com','person@proton.me','first.last+wellness@company.co.uk','member@subdomain.example.org'])assert.equal(loginCredentials(email,'unchanged passphrase').email,email);
  assert.equal(emailAddress('  PERSON@OUTLOOK.COM  '),'person@outlook.com');
  for(const email of ['','person@','person@gmail','person@@gmail.com','person name@yahoo.com'])assert.throws(()=>emailAddress(email));
});
test('private access requires a server-returned email confirmation and matching session identity',()=>{
  const user={id:'owner',email:'person@gmail.com',email_confirmed_at:'2026-10-01T00:00:00Z'};
  assert.doesNotThrow(()=>requireVerifiedEmail('owner',user));
  assert.throws(()=>requireVerifiedEmail('owner',{...user,email_confirmed_at:undefined}),/Verify your email/);
  assert.throws(()=>requireVerifiedEmail('owner',{...user,email:''}),/Verify your email/);
  assert.throws(()=>requireVerifiedEmail('different-account',user),/could not be verified/);
  assert.throws(()=>requireVerifiedEmail('owner',null),/could not be verified/);
});
test('sign-in errors are helpful without echoing unexpected backend data',()=>{
  assert.match(signInErrorMessage({code:'invalid_credentials'}),/email and password/);
  assert.match(signInErrorMessage({code:'email_not_confirmed'}),/Verify your email/);
  assert.match(signInErrorMessage({status:429}),/Too many attempts/);
  assert.match(signInErrorMessage(new Error('Network request failed')),/internet connection/);
  assert.match(signInErrorMessage(new Error('Sign-in request timed out.')),/internet connection/);
  assert.equal(signInErrorMessage(new Error('private backend details')), 'We couldn’t sign you in just now. Please try again.');
});
test('remembered sessions retain the existing secure-storage key and survive adapter recreation',async()=>{
  const fixture=secureFixture();fixture.values.set(key,'existing-session');fixture.values.set('local-workspace-owner','owner');
  const first=createSessionStorage(fixture.storage,key);assert.equal(await first.getRememberMe(),true);assert.equal(await first.getItem(key),'existing-session');
  await first.setRememberMe(true);await first.setItem(key,'refreshed-session');
  const restarted=createSessionStorage(fixture.storage,key);assert.equal(await restarted.getItem(key),'refreshed-session');assert.equal(fixture.values.get('local-workspace-owner'),'owner');
});
test('Remember Me opt-out keeps login and refresh tokens in memory while retaining reset verifiers',async()=>{
  const fixture=secureFixture();fixture.values.set(key,'old-token');fixture.values.set(`${key}-user`,'old-user');fixture.values.set('local-workspace-owner','owner');
  const first=createSessionStorage(fixture.storage,key);await first.setRememberMe(false);await first.setItem(key,'new-token');await first.setItem(`${key}-user`,'new-user');await first.setItem(`${key}-code-verifier`,'password-reset-verifier');
  assert.equal(await first.getItem(key),'new-token');assert.equal(fixture.values.has(key),false);assert.equal(fixture.values.has(`${key}-user`),false);
  await first.setItem(key,'refreshed-token');assert.equal(await first.getItem(key),'refreshed-token');assert.equal(fixture.values.has(key),false);
  const restarted=createSessionStorage(fixture.storage,key);assert.equal(await restarted.getRememberMe(),false);assert.equal(await restarted.getItem(key),null);assert.equal(await restarted.getItem(`${key}-user`),null);assert.equal(await restarted.getItem(`${key}-code-verifier`),'password-reset-verifier');assert.equal(fixture.values.get('local-workspace-owner'),'owner');
});
test('opting out fails closed if native token deletion is interrupted',async()=>{
  const fixture=secureFixture();fixture.values.set(key,'prior-token');fixture.setDeletionFailure(true);
  const first=createSessionStorage(fixture.storage,key);await assert.rejects(first.setRememberMe(false),/Keychain/);
  assert.equal(await createSessionStorage(fixture.storage,key).getItem(key),null);
  fixture.setDeletionFailure(false);await first.setRememberMe(false);await first.setItem(key,'temporary');assert.equal(fixture.values.has(key),false);
});
test('switching persistence is serialized with refresh writes and clears temporary credentials',async()=>{
  const fixture=secureFixture(),session=createSessionStorage(fixture.storage,key);
  await Promise.all([session.setRememberMe(false),session.setItem(key,'temporary'),session.setRememberMe(true),session.setItem(key,'remembered')]);
  assert.equal(await session.getItem(key),'remembered');assert.equal(await createSessionStorage(fixture.storage,key).getItem(key),'remembered');
  await session.removeItem(key);assert.equal(await session.getItem(key),null);assert.equal(fixture.values.has(key),false);
});
test('unreadable Remember Me preferences cannot silently restore a session',async()=>{
  const fixture=secureFixture();fixture.values.set('remember-email-session','malformed');fixture.values.set(key,'old-token');
  await assert.rejects(createSessionStorage(fixture.storage,key).getItem(key),/preference could not be read/);
});
test('installed Supabase SDK honors persistent and process-only email sessions across restarts',async()=>{
  // Explicit HTTP fixtures verify SDK integration; no real credentials or live backend are used.
  const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'person@outlook.com',email_confirmed_at:'2026-01-01T00:00:00Z',created_at:'2026-01-01T00:00:00Z',app_metadata:{provider:'email'},user_metadata:{},identities:[]};
  const token=['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'test-signature'].join('.');
  for(const remember of [true,false]){
    const fixture=secureFixture(),storage=createSessionStorage(fixture.storage,key);await storage.setRememberMe(remember);
    const transport:typeof fetch=async()=>new Response(JSON.stringify({access_token:token,refresh_token:'test-refresh',expires_in:3600,token_type:'bearer',user}),{status:200,headers:{'Content-Type':'application/json'}});
    const clientFor=(adapter:typeof storage)=>createClient('https://project.supabase.co','sb_publishable_1234567890abcdef',{auth:{storage:adapter,storageKey:key,persistSession:true,autoRefreshToken:false,detectSessionInUrl:false,flowType:'pkce',lock:processLock},global:{fetch:transport}});
    const current=clientFor(storage);const result=await current.auth.signInWithPassword(loginCredentials(user.email,'a real-shaped test passphrase'));assert.equal(result.error,null);requireVerifiedEmail(result.data.session!.user.id,result.data.user);
    assert.equal((await current.auth.getSession()).data.session?.user.id,user.id);
    const restarted=clientFor(createSessionStorage(fixture.storage,key));assert.equal(!!(await restarted.auth.getSession()).data.session,remember);
    await current.auth.signOut({scope:'local'});assert.equal(await storage.getItem(key),null);
  }
});
