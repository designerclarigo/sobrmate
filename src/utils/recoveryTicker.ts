import { getLocalDateString } from './date';

export type ClockCadence = 'second' | 'day';

/** One foreground timer, scheduled at the precision the visible screens need. */
export function createRecoveryTicker({
  now = Date.now,
  schedule = (callback: () => void, delay: number) => {
    const timer = setTimeout(callback, delay);
    return () => clearTimeout(timer);
  },
}: { now?: () => number; schedule?: (callback: () => void, delay: number) => () => void } = {}) {
  let second = now();
  let day = second;
  let date = getLocalDateString(new Date(second));
  let active = true;
  let cancelTimer: (() => void) | undefined;
  const seconds = new Set<() => void>();
  const days = new Set<() => void>();

  const refresh = (resume = false) => {
    const timestamp = now();
    const changed = timestamp !== second;
    second = timestamp;
    const nextDate = getLocalDateString(new Date(timestamp));
    if (changed || resume) [...seconds].forEach(listener => listener());
    if (nextDate !== date || resume) {
      date = nextDate;
      day = timestamp;
      [...days].forEach(listener => listener());
    }
  };
  const plan = () => {
    cancelTimer?.();
    cancelTimer = undefined;
    if (!active || (!seconds.size && !days.size)) return;
    const timestamp = now();
    const midnight = new Date(timestamp);
    midnight.setHours(24, 0, 0, 0);
    const delay = seconds.size ? 1000 - timestamp % 1000 : Math.max(1, midnight.getTime() - timestamp);
    cancelTimer = schedule(() => { cancelTimer = undefined; refresh(); plan(); }, delay);
  };
  return {
    getSecond: () => second,
    getDay: () => day,
    subscribe(cadence: ClockCadence, listener: () => void) {
      refresh();
      if (cadence === 'day' && !days.size) day = now();
      const listeners = cadence === 'second' ? seconds : days;
      listeners.add(listener);
      plan();
      return () => { listeners.delete(listener); plan(); };
    },
    setActive(value: boolean) {
      if (active === value) return;
      active = value;
      if (value) refresh(true);
      plan();
    },
  };
}
