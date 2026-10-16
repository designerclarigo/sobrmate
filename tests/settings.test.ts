import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeSettingsPreferences, emptySettingsPreferences, FeatureDraft, reminderTime, saveFeatureDraft, validateProfile } from '../src/components/settings/settingsPreferences';

const idea:FeatureDraft={id:'idea-1',category:'Accessibility',title:'  Larger date labels  ',details:'  Let me adjust the size of calendar dates.  '};
test('Settings drafts, rating and widget style survive a persistence round trip',()=>{
  const saved=saveFeatureDraft({...emptySettingsPreferences(),rating:4,feedback:'A calmer space.',widgetStyle:'detailed'},idea);
  const reopened=decodeSettingsPreferences(JSON.stringify(saved));
  assert.deepEqual(reopened,saved);assert.equal(reopened.featureDrafts[0].title,'Larger date labels');assert.equal(reopened.widgetStyle,'detailed');assert.equal(reopened.rating,4);
  assert.deepEqual(decodeSettingsPreferences(null),emptySettingsPreferences());
});
test('editing a draft preserves other drafts and unrelated preferences without mutation',()=>{
  const original=saveFeatureDraft(saveFeatureDraft(emptySettingsPreferences(),idea),{...idea,id:'idea-2',title:'Second idea'});
  const before=JSON.stringify(original),edited=saveFeatureDraft(original,{...idea,title:'Updated title'});
  assert.equal(edited.featureDrafts.length,2);assert.equal(edited.featureDrafts[0].title,'Updated title');assert.equal(edited.featureDrafts[1].id,'idea-2');assert.equal(edited.rating,original.rating);assert.equal(JSON.stringify(original),before);
});
test('draft validation prevents empty ideas and caps new drafts while allowing edits',()=>{
  assert.throws(()=>saveFeatureDraft(emptySettingsPreferences(),{...idea,title:'  '}),/at least/);
  assert.throws(()=>saveFeatureDraft(emptySettingsPreferences(),{...idea,details:'small'}),/at least/);
  let data=emptySettingsPreferences();for(let i=0;i<30;i++)data=saveFeatureDraft(data,{...idea,id:`idea-${i}`});
  assert.throws(()=>saveFeatureDraft(data,{...idea,id:'idea-31'}),/30 drafts/);
  assert.equal(saveFeatureDraft(data,{...idea,title:'Edit at the limit'}).featureDrafts.length,30);
});
test('unreadable or unsupported Settings storage is rejected instead of silently discarded',()=>{
  for(const raw of ['{','null',JSON.stringify({...emptySettingsPreferences(),version:2}),JSON.stringify({...emptySettingsPreferences(),rating:7}),JSON.stringify({...emptySettingsPreferences(),featureDrafts:[idea,idea]}),JSON.stringify({...emptySettingsPreferences(),widgetStyle:'unknown'})])assert.throws(()=>decodeSettingsPreferences(raw),/saved copy has been kept/);
});
test('native profiles retain existing name lengths and optional email with validation',()=>{
  assert.deepEqual(validateProfile('  River  ','  river@example.com  '),{userName:'River',userEmail:'river@example.com'});
  assert.equal(validateProfile('A'.repeat(60),'').userName.length,60);assert.throws(()=>validateProfile('  ',''),/display name/);assert.throws(()=>validateProfile('River','bad@'),/valid email/);
});
test('reminder hour and minute controls normalize valid local times and reject invalid values',()=>{
  assert.equal(reminderTime('8','5'),'08:05');assert.equal(reminderTime('00','00'),'00:00');assert.equal(reminderTime('23','59'),'23:59');
  for(const [hour,minute] of [['24','00'],['23','60'],['','30'],['-1','00'],['8.5','00'],['aa','bb']])assert.throws(()=>reminderTime(hour,minute),/00:00 to 23:59/);
});
