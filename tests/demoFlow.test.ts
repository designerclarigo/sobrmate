import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDemoAuth,DEMO_ACCOUNT} from '../src/auth/demo';
import {resolveAuthMode,workspaceKey} from '../src/auth/mode';
import {createRecoveryStorage,emptyRecoveryData} from '../src/data/recoveryStorage';
import {commitSetupHabit,TrackerSetupDraft,trackerIdForDraft,validateSetupDraft,withSetupDraft} from '../src/data/setupDraft';
import {emptyPersonalization} from '../src/data/personalization';
import {launchRoute} from '../src/utils/navigation';
import {decodeRecoveryData} from '../src/data/schema';
import {removeHabit} from '../src/data/recovery';
import type {Habit} from '../src/data/types';

function localStore(){
  const values=new Map<string,string>(),reads:string[]=[];let fail=false;
  const store={getItem:async(key:string)=>{reads.push(key);return values.get(key)??null;},setItem:async(key:string,value:string)=>{if(fail)throw new Error('Device storage unavailable');values.set(key,value);},removeItem:async(key:string)=>{values.delete(key);},multiGet:async(keys:string[])=>Promise.all(keys.map(async key=>[key,await store.getItem(key)] as [string,string|null])),multiRemove:async(keys:string[])=>{keys.forEach(key=>values.delete(key));}};
  return {values,reads,store,setFailure:(next:boolean)=>{fail=next;}};
}
function draft():TrackerSetupDraft{return {version:1,id:'setup-11111111-1111-4111-8111-111111111111',phase:'wizard',habit:{id:'custom',title:'A calmer day',category:'custom'},form:{currentStep:7,habitTitle:'A calmer day',quitTiming:'custom',customDaysAgo:'3',personalWhy:'Be present',selectedImprovements:['Mental Clarity'],currentMindset:'Ready',personalGoal:'One Day at a Time',customMetric:'count',customUnit:'cups',financialEnabled:true,costPerDay:'4.50',timeEnabled:true,hoursPerDay:'0.5',personalization:{...emptyPersonalization(),motivation:'Feel healthier',triggers:['Boredom']},questionnaireStep:2}};}
function habit(id='production-habit'):Habit{return {id,title:'A calmer day',category:'custom',quitDate:'2020-01-01T00:00:00Z',accentColor:'#79658E',iconName:'Leaf',pledge:'Be present',financialTracking:{enabled:true,costPerDay:4.5,currency:'$'},timeTracking:{enabled:true,hoursPerDaySaved:0.5},longestStreakDays:0,resetsCount:0,createdAt:'2020-01-01T00:00:00Z'};}

test('release mode always selects real Supabase regardless of public demo flags or missing configuration',()=>{
  for(const flag of [undefined,'auto','demo','supabase','invalid'])for(const configured of [true,false])assert.equal(resolveAuthMode(false,flag,configured),'supabase');
});
test('development defaults to a labeled demo only without Supabase, with explicit mode overrides',()=>{
  assert.equal(resolveAuthMode(true,undefined,false),'demo');assert.equal(resolveAuthMode(true,undefined,true),'supabase');
  assert.equal(resolveAuthMode(true,'demo',true),'demo');assert.equal(resolveAuthMode(true,'supabase',false),'supabase');assert.equal(resolveAuthMode(true,'typo',false),'supabase');
});
test('demo authentication accepts only its documented account and never stores the password or a Supabase token',async()=>{
  const fixture=localStore(),demo=createDemoAuth(fixture.store,true);
  for(const credentials of [[DEMO_ACCOUNT.email,'wrong'],['another@gmail.com',DEMO_ACCOUNT.password]])await assert.rejects(demo.signIn(credentials[0],credentials[1],true),{code:'demo_invalid_credentials'});
  const user=await demo.signIn(' DEMO@KOMOREBI.APP ',DEMO_ACCOUNT.password,true);assert.deepEqual(user,{id:DEMO_ACCOUNT.id,email:DEMO_ACCOUNT.email,source:'demo'});
  assert.equal(user.source,'demo');assert.equal([...fixture.values.values()].some(value=>value.includes(DEMO_ACCOUNT.password)||value.includes('access_token')||value.includes('refresh_token')),false);
});
test('a disabled demo service cannot restore even a preexisting or forged demo session',async()=>{
  const fixture=localStore();fixture.values.set('demo-email-session-v1',JSON.stringify({version:1,mode:'demo',accountId:DEMO_ACCOUNT.id}));
  const disabled=createDemoAuth(fixture.store,false);await assert.rejects(disabled.restore(),{code:'demo_unavailable'});await assert.rejects(disabled.signIn(DEMO_ACCOUNT.email,DEMO_ACCOUNT.password,true),{code:'demo_unavailable'});assert.deepEqual(fixture.reads,[]);
});
test('demo sessions honor Remember Me and sign-out without touching production credentials',async()=>{
  const fixture=localStore();fixture.values.set('local-workspace-owner','original-owner');fixture.values.set('sb-real-auth-token','real-token');
  const first=createDemoAuth(fixture.store,true);await first.signIn(DEMO_ACCOUNT.email,DEMO_ACCOUNT.password,true);assert.equal((await createDemoAuth(fixture.store,true).restore()).user?.source,'demo');
  await first.signOut();assert.equal((await createDemoAuth(fixture.store,true).restore()).user,null);
  await first.signIn(DEMO_ACCOUNT.email,DEMO_ACCOUNT.password,false);assert.ok((await first.restore()).user);assert.equal((await createDemoAuth(fixture.store,true).restore()).user,null);
  assert.equal(fixture.values.get('local-workspace-owner'),'original-owner');assert.equal(fixture.values.get('sb-real-auth-token'),'real-token');
});
test('demo records cannot read, migrate, clear or overwrite the production archive',async()=>{
  const fixture=localStore(),production=createRecoveryStorage(fixture.store,'supabase'),demo=createRecoveryStorage(fixture.store,'demo');
  const original={...emptyRecoveryData(),habits:[habit()],activeHabitId:'production-habit',hasCompletedOnboarding:true};await production.save(original);fixture.values.set('@komorebi:habits:v1','protected legacy sentinel');fixture.reads.length=0;
  assert.deepEqual(await demo.load(),emptyRecoveryData());assert.ok(fixture.reads.every(key=>key.startsWith('demo.')));
  await demo.save({...emptyRecoveryData(),onboardingStep:1});await demo.clearAllData();assert.deepEqual(await production.load(),original);assert.equal(fixture.values.get('@komorebi:habits:v1'),'protected legacy sentinel');
  for(const key of ['@komorebi:state:v2','@komorebi:mock-membership:v1','@komorebi:settings-preferences:v1','komorebi.passcode.v1','komorebi-daily-pledge']){assert.equal(workspaceKey(key,'supabase'),key);assert.notEqual(workspaceKey(key,'demo'),key);}
});
test('first launch follows Onboarding then Login then Setup then Dashboard and persists every stage',async()=>{
  const fixture=localStore(),storage=createRecoveryStorage(fixture.store,'demo'),demo=createDemoAuth(fixture.store,true);
  let data=await storage.load();assert.equal(launchRoute(data.hasCompletedOnboarding,false,false),'/onboarding');
  await storage.save({...data,onboardingStep:1});data=await storage.load();assert.equal(data.onboardingStep,1);assert.equal(launchRoute(false,false,false),'/onboarding');
  data={...data,hasCompletedOnboarding:true,onboardingStep:2};await storage.save(data);assert.equal(launchRoute(true,false,false),'/login');
  await demo.signIn(DEMO_ACCOUNT.email,DEMO_ACCOUNT.password,true);assert.equal(launchRoute(true,!!(await demo.restore()).user,false),'/habit/new');
  data=withSetupDraft(data,draft());await storage.save(data);data=await storage.load();assert.deepEqual(data.setupDraft,draft());assert.equal(data.setupDraft?.form?.questionnaireStep,2);
  data=commitSetupHabit(data,habit(trackerIdForDraft(draft().id)),draft().id);await storage.save(data);data=await storage.load();assert.equal(data.setupDraft,undefined);assert.equal(data.hasCompletedSetup,true);assert.equal(launchRoute(true,!!(await createDemoAuth(fixture.store,true).restore()).user,!!data.hasCompletedSetup),'/(tabs)');
  await demo.signOut();assert.equal(launchRoute(data.hasCompletedOnboarding,false,!!data.hasCompletedSetup),'/login');assert.equal((await storage.load()).hasCompletedOnboarding,true);
});
test('saved setup answers, estimates and exact step survive sign-out and reload',async()=>{
  const fixture=localStore(),storage=createRecoveryStorage(fixture.store,'demo'),demo=createDemoAuth(fixture.store,true);
  await demo.signIn(DEMO_ACCOUNT.email,DEMO_ACCOUNT.password,true);await storage.save(withSetupDraft({...emptyRecoveryData(),hasCompletedOnboarding:true},draft()));await demo.signOut();
  const loaded=await storage.load();assert.equal(launchRoute(loaded.hasCompletedOnboarding,false,false),'/login');await demo.signIn(DEMO_ACCOUNT.email,DEMO_ACCOUNT.password,true);
  assert.equal(launchRoute(loaded.hasCompletedOnboarding,!!(await demo.restore()).user,false),'/habit/new');assert.deepEqual(loaded.setupDraft?.form,draft().form);
});
test('tracker creation is idempotent and delayed autosave cannot resurrect a completed draft',()=>{
  const saved=withSetupDraft(emptyRecoveryData(),draft()),created=habit(trackerIdForDraft(draft().id)),completed=commitSetupHabit(saved,created,draft().id);
  assert.equal(completed.setupDraft,undefined);assert.equal(commitSetupHabit(completed,created,draft().id),completed);assert.equal(withSetupDraft(completed,draft()),completed);assert.equal(completed.habits.length,1);
});
test('deleting all trackers preserves completed setup and returning users still reach Dashboard',()=>{
  const data=commitSetupHabit({...emptyRecoveryData(),hasCompletedOnboarding:true},habit());const empty=removeHabit(data,'production-habit');assert.equal(empty.habits.length,0);assert.equal(empty.hasCompletedSetup,true);assert.equal(launchRoute(true,true,!!empty.hasCompletedSetup),'/(tabs)');
});
test('legacy archives stay compatible and invalid setup metadata is rejected before restore',()=>{
  const legacy={...emptyRecoveryData(),habits:[habit()],hasCompletedOnboarding:true};assert.equal(decodeRecoveryData(JSON.stringify({version:2,data:legacy})).habits[0].id,'production-habit');
  for(const invalid of [{onboardingStep:3},{hasCompletedSetup:'yes'},{setupDraft:{...draft(),form:{...draft().form,currentStep:10}}},{setupDraft:{...draft(),id:'not-a-draft'}},{setupDraft:{...draft(),form:{...draft().form,personalization:{version:2}}}}])assert.throws(()=>decodeRecoveryData(JSON.stringify({version:2,data:{...emptyRecoveryData(),...invalid}})));
});
test('incomplete text fields persist so invalid estimates can be corrected rather than silently replaced',async()=>{
  const incomplete:TrackerSetupDraft={...draft(),form:{...draft().form!,costPerDay:'unfinished',customDaysAgo:'',habitTitle:''}};assert.doesNotThrow(()=>validateSetupDraft(incomplete));
  const fixture=localStore(),storage=createRecoveryStorage(fixture.store,'demo');await storage.save(withSetupDraft(emptyRecoveryData(),incomplete));assert.deepEqual((await storage.load()).setupDraft,incomplete);
});
test('failed local writes reject without reporting saved onboarding or changing prior data',async()=>{
  const fixture=localStore(),storage=createRecoveryStorage(fixture.store,'demo');await storage.save(emptyRecoveryData());fixture.setFailure(true);await assert.rejects(storage.save({...emptyRecoveryData(),hasCompletedOnboarding:true}),/unavailable/);fixture.setFailure(false);assert.equal((await storage.load()).hasCompletedOnboarding,false);
});
