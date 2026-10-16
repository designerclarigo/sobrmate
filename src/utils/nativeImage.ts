import { Platform, View } from 'react-native';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** Capture the displayed native card. Private journal data never enters the card. */
export async function exportNativeImage(target: View | null, filename: string, save = false, width = 1080, height?: number): Promise<string> {
  if (Platform.OS === 'web') throw new Error('Image export is available in the Android and iOS app. Open this project in Expo Go to share your card.');
  if (!target) throw new Error('The preview is still loading. Please try again.');
  const uri = await captureRef(target, { format: 'png', quality: 1, width, ...(height ? { height } : {}), result: 'tmpfile' });
  try {
    if (save) {
      const destination = new File(Paths.document, `${Date.now()}-${filename}`);
      await new File(uri).copy(destination);
      return 'PNG saved to app files. Use Share Image to save it in another destination.';
    }
    if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is unavailable on this device. Use Save Image instead.');
    await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: 'Share your SobrMate card' });
    return 'Opened in the system sharing sheet.';
  } finally { releaseCapture(uri); }
}
