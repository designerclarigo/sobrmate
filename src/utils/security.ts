import {localWorkspaceKey} from '../data/workspace';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
const KEY = localWorkspaceKey('komorebi.passcode.v1');
interface Credential { salt: string; digest: string; attempts: number; blockedUntil: number }
async function digest(pin: string, salt: string) { return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`); }
async function read(): Promise<Credential | null> {
  if (Platform.OS === 'web') return null;
  const raw = await SecureStore.getItemAsync(KEY);
  return raw ? JSON.parse(raw) : null;
}
export async function savePasscode(pin: string) {
  if (!/^\d{4}$/.test(pin)) throw new Error('Choose a four-digit PIN.');
  if (Platform.OS === 'web') throw new Error('App lock is available in the iOS and Android app.');
  const salt = Crypto.randomUUID();
  await SecureStore.setItemAsync(KEY, JSON.stringify({ salt, digest: await digest(pin, salt), attempts: 0, blockedUntil: 0 }), { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
}
export async function hasPasscode() { return !!(await read()); }
export async function clearPasscode() { if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(KEY); }
export async function verifyPasscode(pin: string) {
  const credential = await read();
  if (!credential) throw new Error('No PIN is configured for this device.');
  if (credential.blockedUntil > Date.now()) throw new Error(`Please try again in ${Math.ceil((credential.blockedUntil - Date.now()) / 1000)} seconds.`);
  const matched = credential.digest === await digest(pin, credential.salt);
  credential.attempts = matched ? 0 : credential.attempts + 1;
  credential.blockedUntil = credential.attempts >= 5 ? Date.now() + 30000 : 0;
  if (credential.attempts >= 5) credential.attempts = 0;
  await SecureStore.setItemAsync(KEY, JSON.stringify(credential));
  return matched;
}
