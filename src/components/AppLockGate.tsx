import { useTheme, useThemedStyles } from '../design-system/theme';
import React, { useEffect, useState } from 'react';
import { AppState, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LockKeyhole } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Text, colors } from '../design-system';
import { useRecoveryStore } from '../data/store';
import { hasPasscode, savePasscode, verifyPasscode } from '../utils/security';
import { localAuthService } from '../utils/localAuth';
export function AppLockGate({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();

  const { settings, updateSettings } = useRecoveryStore();
  const [locked, setLocked] = useState(settings.appLockEnabled);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  useEffect(() => {
    setLocked(settings.appLockEnabled && Platform.OS !== 'web');
    // Move any legacy clear-text PIN into device secure storage, then remove it from settings.
    if (settings.pinCode && Platform.OS !== 'web') void (async () => {
      if (!(await hasPasscode())) await savePasscode(settings.pinCode!);
      await updateSettings({ pinCode: undefined });
    })().catch(() => setError('Could not migrate your PIN. Please try again.'));
  }, [settings.appLockEnabled]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (settings.appLockEnabled && !authenticating && state !== 'active') { setLocked(true); setPin(''); }
    });
    return () => subscription.remove();
  }, [settings.appLockEnabled, authenticating]);
  const unlock = async (biometric = false) => {
    setBusy(true); setError('');
    try {
      setAuthenticating(true);
      const success = biometric ? (await localAuthService.authenticateWithBiometrics()).success : await verifyPasscode(pin);
      if (success) { setLocked(false); setPin(''); } else setError(biometric ? 'Authentication was cancelled. Use your PIN or try again.' : 'That PIN did not match. Please try again.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to unlock. Please try again.'); }
    finally { setAuthenticating(false); setBusy(false); }
  };
  if (!locked) return <>{children}</>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.canvas }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20, gap: 20 }}>
    <LockKeyhole size={38} color={colors.accent.primary} />
    <Text variant="display" serif>Your private space.</Text>
    <Text color="secondary">Enter your PIN to return to your journey.</Text>
    <Input value={pin} onChangeText={setPin} secureTextEntry keyboardType="number-pad" maxLength={4} accessibilityLabel="Four-digit app PIN" placeholder="Enter PIN" />
    {!!error && <Text color="rose" accessibilityRole="alert">{error}</Text>}
    <Button label="Unlock" loading={busy} disabled={pin.length !== 4} onPress={() => void unlock()} />
    {settings.biometricEnabled && <Button label="Use biometrics" variant="outline" disabled={busy} onPress={() => void unlock(true)} />}
    </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
