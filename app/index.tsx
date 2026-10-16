import { Redirect } from 'expo-router';
import { useRecoveryStore } from '../src/data/store';
import { launchRoute } from '../src/utils/navigation';
import { useAuth } from '../src/auth/AuthProvider';
export default function Index() {
  const { hasCompletedOnboarding,hasCompletedSetup,loadError } = useRecoveryStore();
  const auth=useAuth();
  if(auth.status==='recovery')return <Redirect href="/auth/reset-password"/>;
  return <Redirect href={launchRoute(hasCompletedOnboarding,auth.status==='authenticated',hasCompletedSetup,!!loadError)} />;
}
