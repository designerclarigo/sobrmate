import { useMemo } from 'react';
import { calculateCleanTime } from '../data/recovery';
import { useRecoveryClock } from './recoveryClock';

/** Live values without deriving the entire store and milestone list per tick. */
export function useHabitDuration(quitDate: string) {
  const tick = useRecoveryClock('second');
  return useMemo(() => calculateCleanTime(quitDate, new Date(tick || Date.now())), [quitDate, tick]);
}
