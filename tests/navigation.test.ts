import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialRoute,launchRoute } from '../src/utils/navigation';
test('cold launch respects welcome completion and resumes unfinished tracker setup', () => {
  assert.equal(initialRoute(false,0),'/onboarding');
  assert.equal(initialRoute(false,2),'/onboarding');
  assert.equal(initialRoute(true,0),'/habit/new');
  assert.equal(initialRoute(true,1),'/(tabs)');
  assert.equal(initialRoute(true,8),'/(tabs)');
});
test('launch routing blocks dashboard bypass until onboarding, login and setup are complete',()=>{
  assert.equal(launchRoute(false,false,false),'/onboarding');assert.equal(launchRoute(false,true,true),'/onboarding');
  assert.equal(launchRoute(true,false,true),'/login');assert.equal(launchRoute(true,false,false),'/login');assert.equal(launchRoute(true,true,false),'/habit/new');assert.equal(launchRoute(true,true,true),'/(tabs)');assert.equal(initialRoute(true,0,true),'/(tabs)');
});
test('unreadable saved data permits authentication before protected backup recovery',()=>{
  assert.equal(launchRoute(false,false,false,true),'/login');assert.equal(launchRoute(false,false,false,false),'/onboarding');
});
