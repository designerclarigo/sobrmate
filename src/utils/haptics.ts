import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
let enabled = true;
export function setHapticsEnabled(value: boolean) { enabled = value; }
export function triggerHaptic(style: 'light' | 'medium' | 'selection' = 'light') {
  if (!enabled || Platform.OS === 'web') return;
  const operation = style === 'selection' ? Haptics.selectionAsync() : Haptics.impactAsync(
    style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  void operation.catch(() => undefined);
}
