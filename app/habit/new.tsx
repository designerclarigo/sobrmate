import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {useRecoveryStore} from '../../src/data/store';
import {useAuth} from '../../src/auth/AuthProvider';
import { HABIT_CATALOG } from '../../src/data/habitCatalog';
import { HabitCreationFlow } from '../../src/components/habit-selection/HabitCreationFlow';

export default function NewHabitRouteScreen({
  onCancel,
  onFinished,
}: {
  onCancel?: () => void;
  onFinished?: () => void;
} = {}) {
  const router = useRouter();const {hasCompletedSetup}=useRecoveryStore();const auth=useAuth();
  const { intention } = useLocalSearchParams<{ intention?: string }>();
  const catalogIds: Record<string, string> = { 'habit-alcohol': 'catalog-alcohol-general', 'habit-nicotine': 'catalog-vaping', 'habit-digital': 'catalog-social-media' };
  const initialHabit = intention === 'habit-custom' ? { id: 'custom', title: '', category: 'custom' as const } : HABIT_CATALOG.find(h => h.id === catalogIds[intention ?? '']);

  return (
    <HabitCreationFlow
      initialHabit={initialHabit}
      cancelLabel={hasCompletedSetup?'Save & close':'Save & sign out'}
      onCancel={onCancel || (async() => {if(!hasCompletedSetup){await auth.signOut();router.replace('/');}else if(router.canGoBack())router.back();else router.replace('/');})}
      onFinished={onFinished || (() => router.replace('/'))}
    />
  );
}
