import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { RecoveryData } from '../data/recovery';
import { decodeRecoveryData } from '../data/storage';
export async function exportBackup(data: RecoveryData) {
  const { pinCode: _pin, ...settings } = data.settings;
  const contents = JSON.stringify({ version: 2, data: { ...data, settings: { ...settings, appLockEnabled: false, biometricEnabled: false } } }, null, 2);
  const filename = `komorebi-backup-${new Date().toISOString().slice(0, 10)}.json`;
  if (Platform.OS === 'web') throw new Error('Backup export is available in the Android and iOS app.');
  if (!(await Sharing.isAvailableAsync())) throw new Error('File sharing is unavailable on this device.');
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true }); file.write(contents);
  try { await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Save your SobrMate backup' }); }
  finally { if (file.exists) file.delete(); }
}
export async function pickBackup(): Promise<RecoveryData | null> {
  if (Platform.OS === 'web') throw new Error('Backup restore is available in the Android and iOS app.');
  const selection = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain'], copyToCacheDirectory: true });
  if (selection.canceled) return null;
  const asset = selection.assets[0];
  if ((asset.size ?? 0) > 10 * 1024 * 1024) throw new Error('Choose a backup smaller than 10 MB.');
  const raw = await new File(asset.uri).text();
  if (raw.length > 10 * 1024 * 1024) throw new Error('Choose a backup smaller than 10 MB.');
  return decodeRecoveryData(raw);
}
