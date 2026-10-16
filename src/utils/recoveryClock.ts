import { useSyncExternalStore,useContext } from 'react';
import { AppState } from 'react-native';
import { ClockCadence, createRecoveryTicker } from './recoveryTicker';
import { ScreenVisibilityContext } from '../components/ScreenVisibility';
const ticker = createRecoveryTicker();
let subscriptions = 0;
let appListener: ReturnType<typeof AppState.addEventListener> | undefined;
function subscribe(cadence: ClockCadence, listener: () => void) {
  if (!appListener) {
    ticker.setActive(!AppState.currentState || AppState.currentState === 'active');
    appListener = AppState.addEventListener('change', state => ticker.setActive(state === 'active'));
  }
  subscriptions += 1;
  const unsubscribe = ticker.subscribe(cadence, listener);
  return () => {
    unsubscribe();
    subscriptions -= 1;
    if (!subscriptions) { appListener?.remove(); appListener = undefined; }
  };
}
const subscribeSecond = (listener: () => void) => subscribe('second', listener);
const subscribeDay = (listener: () => void) => subscribe('day', listener);
const subscribeNothing = () => () => {};
const getSecond = ticker.getSecond;
const getDay = ticker.getDay;
const getZero = () => 0;
export function useRecoveryClock(cadence: 'second' | 'day' | false) {
  const visible=useContext(ScreenVisibilityContext);
  if(!visible)cadence=false;
  return useSyncExternalStore(cadence === 'second' ? subscribeSecond : cadence === 'day' ? subscribeDay : subscribeNothing,
    cadence === 'second' ? getSecond : cadence === 'day' ? getDay : getZero, getZero);
}
