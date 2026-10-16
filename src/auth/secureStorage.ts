import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import {createChunkedStorage} from './chunkedStorage';
const options={keychainService:'com.komorebi.recovery.auth',keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY};
export const authStorage=createChunkedStorage({
  getItem:key=>SecureStore.getItemAsync(key,options),
  setItem:(key,value)=>SecureStore.setItemAsync(key,value,options),
  removeItem:key=>SecureStore.deleteItemAsync(key,options),
},Crypto.randomUUID);
export const AUTH_ATTEMPT_KEY='auth-flow-attempt';
export const AUTH_RECOVERY_KEY='auth-recovery-pending';
export const LOCAL_OWNER_KEY='local-workspace-owner';
