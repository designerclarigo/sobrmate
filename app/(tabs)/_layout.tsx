import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Easing } from 'react-native';
import { House, Calendar, Award, Settings } from 'lucide-react-native';
import { BottomTabBar, TabItem, TabKey } from '../../src/design-system/components/BottomTabBar';
import { useRecoveryStore } from '../../src/data/store';
import { FocusedTabContent } from '../../src/components/ScreenVisibility';
import { navigationMetrics } from '../../src/design-system/tokens/navigation';
import { useReducedMotion } from '../../src/utils/useReducedMotion';
const tabs: TabItem[] = [
  { key: 'progress', label: 'Progress', icon: p => <House size={p.size} color={p.color} strokeWidth={navigationMetrics.iconStroke} /> },
  { key: 'calendar', label: 'Calendar', icon: p => <Calendar size={p.size} color={p.color} strokeWidth={navigationMetrics.iconStroke} /> },
  { key: 'milestones', label: 'Milestones', icon: p => <Award size={p.size} color={p.color} strokeWidth={navigationMetrics.iconStroke} /> },
  { key: 'settings', label: 'Settings', icon: p => <Settings size={p.size} color={p.color} strokeWidth={navigationMetrics.iconStroke} /> },
];
const routes: Record<TabKey, string> = { progress: 'index', calendar: 'calendar', milestones: 'milestones', settings: 'settings' };
export default function TabLayout() {
  const { hasCompletedOnboarding,hasCompletedSetup } = useRecoveryStore();
  const reducedMotion = useReducedMotion();
  if (!hasCompletedOnboarding) return <Redirect href="/onboarding" />;
  if(!hasCompletedSetup)return <Redirect href="/habit/new"/>;
  return <Tabs screenOptions={{ headerShown: false, animation: reducedMotion ? 'none' : 'fade',
    transitionSpec: { animation:'timing', config: { duration:reducedMotion ? 0 : navigationMetrics.screenDuration,
      easing:Easing.out(Easing.cubic) } } }} screenLayout={({ children }) => <FocusedTabContent>{children}</FocusedTabContent>} tabBar={({ state, navigation }) => {
    const name = state.routes[state.index].name;
    const currentTab = (Object.keys(routes) as TabKey[]).find(key => routes[key] === name) ?? 'progress';
    return <BottomTabBar currentTab={currentTab} tabs={tabs} onSelectTab={key => {
      const route = state.routes.find(r => r.name === routes[key]);
      if (!route) return;
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!event.defaultPrevented) navigation.navigate(route.name);
    }} />;
  }}>
    <Tabs.Screen name="index" options={{ title: 'Progress' }} />
    <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
    <Tabs.Screen name="milestones" options={{ title: 'Milestones' }} />
    <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
  </Tabs>;
}
