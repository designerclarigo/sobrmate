import { useTheme, useThemedStyles } from '../src/design-system/theme';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RecoveryProvider, useRecoveryStore } from '../src/data/store';
import { PremiumProvider } from '../src/data/premium';
import { PremiumExperience } from '../src/components/premium/PremiumExperience';
import { DashboardSkeleton } from '../src/design-system/components/Skeleton';
import { Button, Text, Modal, colors } from '../src/design-system';
import { pickBackup } from '../src/utils/backup';
import { RecoveryData } from '../src/data/recovery';
import { AppLockGate } from '../src/components/AppLockGate';
import { ReminderSync } from '../src/components/ReminderSync';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { SplashScreen } from '../src/onboarding/SplashScreen';
import { AuthProvider,useAuth } from '../src/auth/AuthProvider';
import {authenticationMode} from '../src/auth/runtime';
import { ThemeProvider } from '../src/design-system/theme';
import { useFonts } from 'expo-font';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';

function RootNavigator() {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const { isLoading, loadError, retryLoad, operationError, dismissError, restoreBackup, hasCompletedOnboarding,hasCompletedSetup } = useRecoveryStore();
  const auth=useAuth();
  const canEnter=auth.status==='authenticated';
  const [backup, setBackup] = useState<RecoveryData | null>(null);
  const [recoveryError, setRecoveryError] = useState('');
  const [splashFinished, setSplashFinished] = useState(false);
  const finishSplash = useCallback(() => setSplashFinished(true), []);
  if (!splashFinished) return <SplashScreen onFinish={finishSplash} returning={hasCompletedOnboarding} />;
  if(isLoading||auth.status==='loading')return <View style={styles.loading}><ActivityIndicator color={colors.accent.primary}/><Text color="secondary" style={{marginTop:16}}>Opening your secure session…</Text></View>;
  if(!canEnter)return <AppRoutes authenticated={false} recovery={auth.status==='recovery'} completed={hasCompletedOnboarding||!!loadError} setupCompleted={hasCompletedSetup}/>;
  if (isLoading || loadError) return <View style={styles.loading}>
    <Text variant="display" serif>SobrMate.</Text>
    <Text color="secondary" align="center" style={{ marginVertical: 20 }}>{loadError ?? 'Opening your space for growth…'}</Text>
    {loadError ? <View style={{ gap: 16, width: '100%' }}><Button label="Try again" onPress={retryLoad} />
      <Button label="Restore a backup" variant="outline" onPress={async () => { try { const selected = await pickBackup(); setBackup(selected); setRecoveryError(''); } catch (e) { setRecoveryError(e instanceof Error ? e.message : 'Unable to open this backup.'); } }} />
      {!!recoveryError && <Text color="rose">{recoveryError}</Text>}
      <Modal visible={!!backup} onClose={() => setBackup(null)} title="Recover your journey?" description={`Replace the unreadable saved data with ${backup?.habits.length ?? 0} trackers and ${backup?.checkIns.length ?? 0} check-ins from this archive.`}>
        <Button label="Restore this archive" onPress={async () => { if (backup) { await restoreBackup(backup); setBackup(null); await retryLoad(); } }} />
      </Modal>
    </View> : <DashboardSkeleton />}
  </View>;
  return <AppLockGate>
    {operationError && <Pressable style={styles.error} onPress={dismissError} accessibilityRole="alert">
      <Text color="rose" variant="caption">{operationError} Tap to dismiss.</Text>
    </Pressable>}
    <AppRoutes authenticated recovery={false} completed={hasCompletedOnboarding} setupCompleted={hasCompletedSetup}/>
    <PremiumExperience />
  </AppLockGate>;
}
function AppRoutes({authenticated,recovery,completed,setupCompleted}:{authenticated:boolean;recovery:boolean;completed:boolean;setupCompleted:boolean}){
  const {colors}=useTheme();
  return <Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.background.canvas},animation:'slide_from_right'}}>
    <Stack.Screen name="index"/>
    <Stack.Screen name="auth/callback"/>
    <Stack.Protected guard={!completed||authenticated}><Stack.Screen name="onboarding" options={{gestureEnabled:false,animation:'fade'}}/></Stack.Protected>
    <Stack.Protected guard={!authenticated&&completed}><Stack.Screen name="login"/><Stack.Screen name="forgot-password"/></Stack.Protected>
    <Stack.Protected guard={recovery}><Stack.Screen name="auth/reset-password"/></Stack.Protected>
    <Stack.Protected guard={authenticated&&completed}>
      <Stack.Screen name="habit/new" options={{presentation:'fullScreenModal',gestureEnabled:setupCompleted}}/>
      <Stack.Protected guard={setupCompleted}>
        <Stack.Screen name="(tabs)"/>
        <Stack.Screen name="habit/[id]"/>
        <Stack.Screen name="checkin/index" options={{presentation:'transparentModal',contentStyle:{backgroundColor:'transparent'}}}/>
        <Stack.Screen name="milestone/index"/>
      </Stack.Protected>
    </Stack.Protected>
  </Stack>;
}
function AppFrame() {
  const styles = useThemedStyles(baseStyles);
  const { isDark }=useTheme();
  const auth=useAuth();
  return <View style={styles.canvas}><View style={styles.viewport}><StatusBar style={isDark ? 'light' : 'dark'} /><ReminderSync enabled={auth.status==='authenticated'}/><RootNavigator /></View></View>;
}
export default function RootLayout() {
  const [fontsLoaded,fontError]=useFonts({ PlusJakartaSans_400Regular,PlusJakartaSans_500Medium,PlusJakartaSans_600SemiBold,PlusJakartaSans_700Bold });
  // Hydrate saved data while fonts load, rather than starting storage afterward.
  return <SafeAreaProvider><ErrorBoundary><AuthProvider key={authenticationMode}><RecoveryProvider key={authenticationMode}><ThemeProvider><PremiumProvider>
    {!fontsLoaded && !fontError ? <View style={{ flex:1,backgroundColor:colors.background.canvas,justifyContent:'center',alignItems:'center' }}><ActivityIndicator color={colors.accent.primary} /></View> : <AppFrame />}
  </PremiumProvider></ThemeProvider></RecoveryProvider></AuthProvider></ErrorBoundary></SafeAreaProvider>;
}
const baseStyles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: colors.background.canvas, alignItems: 'center' },
  viewport: { flex: 1, width: '100%', maxWidth: 600, backgroundColor: colors.background.canvas },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  error: { padding: 12, backgroundColor: colors.accent.roseLight },
});
