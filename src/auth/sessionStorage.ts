import type {SecretStore} from './chunkedStorage';

/** Supabase keeps its normal refresh lifecycle; only the session's storage changes. */
export function createSessionStorage(secure:SecretStore,sessionKey:string,rememberKey='remember-email-session') {
  const temporary=new Map<string,string>();
  const isSession=(key:string)=>key===sessionKey||key===`${sessionKey}-user`;
  let remember:boolean|undefined;
  let queue:Promise<unknown>=Promise.resolve();
  const serial=<T,>(action:()=>Promise<T>)=>{
    const result=queue.then(action);queue=result.catch(()=>undefined);return result;
  };
  const preference=async()=>{
    if(remember===undefined){
      const saved=await secure.getItem(rememberKey);
      if(saved!==null&&saved!=='true'&&saved!=='false')throw new Error('Your session preference could not be read. Please retry.');
      remember=saved!=='false'; // Keep sessions created before this preference was introduced.
    }
    return remember;
  };
  return {
    getRememberMe:()=>serial(preference),
    setRememberMe:(value:boolean)=>serial(async()=>{
      const previous=await preference();
      if(!value){
        // Publish the opt-out first: a crash or failed deletion must never restore an old session.
        await secure.setItem(rememberKey,'false');remember=false;
        await secure.removeItem(sessionKey);await secure.removeItem(`${sessionKey}-user`);
      }else{
        if(!previous){await secure.removeItem(sessionKey);await secure.removeItem(`${sessionKey}-user`);temporary.clear();}
        await secure.setItem(rememberKey,'true');remember=true;
      }
    }),
    getItem:(key:string)=>serial(async()=>isSession(key)&&!(await preference())?temporary.get(key)??null:secure.getItem(key)),
    setItem:(key:string,value:string)=>serial(async()=>{
      if(isSession(key)&&!(await preference()))temporary.set(key,value);else await secure.setItem(key,value);
    }),
    removeItem:(key:string)=>serial(async()=>{temporary.delete(key);await secure.removeItem(key);}),
  };
}
