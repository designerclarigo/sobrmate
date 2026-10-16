export interface SecretStore {getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>;removeItem:(key:string)=>Promise<void>}
interface Manifest {version:1;generation:string;chunks:number}
function manifest(raw:string|null):Manifest|null {
  if(raw===null)return null;let value;try{value=JSON.parse(raw);}catch{throw new Error('Secure session storage could not be read.');}
  if(value?.version!==1||typeof value.generation!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(value.generation)||!Number.isInteger(value.chunks)||value.chunks<1||value.chunks>256)throw new Error('Secure session storage could not be read.');
  return value;
}
/** All payloads remain in native encrypted storage; the manifest publishes a write atomically. */
export function createChunkedStorage(store:SecretStore,randomId:()=>string) {
  const keyFor=(key:string)=>{if(!/^[a-zA-Z0-9._-]{1,180}$/.test(key))throw new Error('Invalid secure storage key.');return 'sobrmate.auth.'+key;};
  const chunkKey=(base:string,entry:Manifest,index:number)=>`${base}.${entry.generation}.${index}`;
  const removeChunks=async(base:string,entry:Manifest)=>{await Promise.all(Array.from({length:entry.chunks},(_,i)=>store.removeItem(chunkKey(base,entry,i))));};
  let queue:Promise<unknown>=Promise.resolve();
  const serial=<T,>(action:()=>Promise<T>):Promise<T>=>{const next=queue.then(action);queue=next.catch(()=>undefined);return next;};
  return {
    getItem:(key:string)=>serial(async()=>{const base=keyFor(key),entry=manifest(await store.getItem(base));if(!entry)return null;const chunks=await Promise.all(Array.from({length:entry.chunks},(_,i)=>store.getItem(chunkKey(base,entry,i))));if(chunks.some(v=>v===null))throw new Error('Your secure session is incomplete. Please sign in again.');let decoded;try{decoded=JSON.parse(chunks.join(''));}catch{throw new Error('Invalid secure session. Please sign in again.');}if(typeof decoded!=='string')throw new Error('Invalid secure session.');return decoded;}),
    setItem:(key:string,value:string)=>serial(async()=>{
      const base=keyFor(key),old=manifest(await store.getItem(base));
      const ascii=JSON.stringify(value).replace(/[\u007f-\uffff]/g,char=>'\\u'+char.charCodeAt(0).toString(16).padStart(4,'0'));
      const next:Manifest={version:1,generation:randomId(),chunks:Math.ceil(ascii.length/1600)};
      if(!/^[a-zA-Z0-9-]{8,80}$/.test(next.generation))throw new Error('Unable to create a secure storage identifier.');
      if(next.chunks>256)throw new Error('The authentication session is too large for secure storage.');
      const written:string[]=[];
      try{for(let i=0;i<next.chunks;i++){const key=chunkKey(base,next,i);await store.setItem(key,ascii.slice(i*1600,(i+1)*1600));written.push(key);}await store.setItem(base,JSON.stringify(next));}
      catch(error){await Promise.allSettled(written.map(key=>store.removeItem(key)));throw error;}
      if(old)await removeChunks(base,old).catch(()=>undefined);
    }),
    removeItem:(key:string)=>serial(async()=>{const base=keyFor(key),old=manifest(await store.getItem(base));await store.removeItem(base);if(old)await removeChunks(base,old);}),
  };
}
