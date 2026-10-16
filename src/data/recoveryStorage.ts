import type {RecoveryData} from './recovery';
import {initialUserSettings} from './initialData';
import {decodeRecoveryData} from './schema';
import {AuthenticationMode,workspaceKey} from '../auth/mode';

interface LocalStore {getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<unknown>;multiGet:(keys:string[])=>Promise<readonly (readonly [string,string|null])[]>;multiRemove:(keys:string[])=>Promise<unknown>}
export function emptyRecoveryData():RecoveryData {
  return {habits:[],activeHabitId:'',checkIns:[],pledges:[],settings:{...initialUserSettings},hasCompletedOnboarding:false};
}
export function createRecoveryStorage(store:LocalStore,mode:AuthenticationMode){
  const key=workspaceKey('@komorebi:state:v2',mode);
  const legacyKeys=['@komorebi:habits:v1','@komorebi:active_habit_id:v1','@komorebi:checkins:v1','@komorebi:settings:v1','@komorebi:onboarding_completed:v1'].map(value=>workspaceKey(value,mode));
  const save=async(data:RecoveryData)=>{await store.setItem(key,JSON.stringify({version:2,data}));};
  return {
    async load():Promise<RecoveryData>{
      const raw=await store.getItem(key);if(raw)return decodeRecoveryData(raw);
      const legacy=await store.multiGet(legacyKeys);
      if(legacy.every(([,value])=>value===null))return emptyRecoveryData();
      const values=legacy.map(([,value])=>value);
      const migrated=decodeRecoveryData(JSON.stringify({habits:values[0]?JSON.parse(values[0]):[],activeHabitId:values[1]??'',checkIns:values[2]?JSON.parse(values[2]):[],settings:values[3]?JSON.parse(values[3]):initialUserSettings,hasCompletedOnboarding:values[4]==='true'}));
      await save(migrated);return migrated;
    },
    save,
    async clearAllData(){await save(emptyRecoveryData());await store.multiRemove(legacyKeys);},
    async removeLegacyData(){await store.multiRemove(legacyKeys);},
  };
}
