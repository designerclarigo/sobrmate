import { useRouter } from 'expo-router';
import { useRecoveryStore } from '../src/data/store';
import { OnboardingFlow } from '../src/onboarding/OnboardingFlow';
export default function Onboarding() {
  const { completeOnboarding,saveOnboardingStep,onboardingStep } = useRecoveryStore();
  const router = useRouter();
  const finish = async () => {
    await completeOnboarding();
    router.replace('/');
  };
  return <OnboardingFlow onComplete={finish} initialStep={(onboardingStep??0) as 0|1|2} onStepChange={saveOnboardingStep}/>;
}
