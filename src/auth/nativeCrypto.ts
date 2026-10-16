import 'fast-text-encoding';
import * as ExpoCrypto from 'expo-crypto';
// Supabase PKCE must use a native CSPRNG and S256, including on Hermes without Web Crypto.
const nativeGlobal=globalThis as unknown as {crypto?:{getRandomValues?:typeof ExpoCrypto.getRandomValues;randomUUID?:()=>string;subtle?:{digest?:(algorithm:string|{name:string},data:BufferSource)=>Promise<ArrayBuffer>}}};
const crypto=nativeGlobal.crypto??{};
if(!crypto.getRandomValues)crypto.getRandomValues=ExpoCrypto.getRandomValues;
if(!crypto.randomUUID)crypto.randomUUID=ExpoCrypto.randomUUID;
if(!crypto.subtle?.digest)crypto.subtle={...crypto.subtle,digest:(algorithm,data)=>{
  const name=typeof algorithm==='string'?algorithm:algorithm.name;
  if(name.toUpperCase()!=='SHA-256')return Promise.reject(new Error('Unsupported authentication digest.'));
  return ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256,data);
}};
if(!nativeGlobal.crypto)Object.defineProperty(globalThis,'crypto',{value:crypto,configurable:true});
