/** Cold launches resume setup without replaying a completed welcome tour. */
export function initialRoute(completedWelcome:boolean, trackerCount:number,completedSetup=trackerCount>0):'/onboarding'|'/habit/new'|'/(tabs)' {
  if (!completedWelcome) return '/onboarding';
  return completedSetup||trackerCount>0 ? '/(tabs)' : '/habit/new';
}
export function launchRoute(completedWelcome:boolean,authenticated:boolean,completedSetup:boolean,needsRecovery=false):'/onboarding'|'/login'|'/habit/new'|'/(tabs)'{
  if(needsRecovery&&!authenticated)return '/login';
  if(!completedWelcome)return '/onboarding';
  if(!authenticated)return '/login';
  return completedSetup?'/(tabs)':'/habit/new';
}
