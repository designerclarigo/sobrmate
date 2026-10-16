import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeSettingsPreferences, emptySettingsPreferences, SETTINGS_PREFERENCES_KEY, SettingsPreferences } from './settingsPreferences';

/** Settings-only preview preferences and unsent drafts; never touches tracker storage. */
export function useSettingsPreferences() {
  const [data, setData] = useState(emptySettingsPreferences);
  const [loading, setLoading] = useState(true), [error, setError] = useState('');
  const current = useRef(data), ready = useRef(false), flight = useRef(false);
  const mounted = useRef(true);
  const load = useCallback(async () => {
    if (flight.current) return;
    flight.current = true; ready.current = false; setLoading(true); setError('');
    try {
      const next = decodeSettingsPreferences(await AsyncStorage.getItem(SETTINGS_PREFERENCES_KEY));
      current.current = next; ready.current = true;
      if (mounted.current) setData(next);
    } catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : 'Unable to read Settings drafts.'); }
    finally { flight.current = false; if (mounted.current) setLoading(false); }
  }, []);
  useEffect(() => { mounted.current = true; void load(); return () => { mounted.current = false; }; }, [load]);
  const save = useCallback(async (change: (previous: SettingsPreferences) => SettingsPreferences) => {
    if (!ready.current) throw new Error('Settings drafts have not loaded. Retry before saving.');
    if (flight.current) throw new Error('A Settings change is already being saved.');
    flight.current = true;
    try {
      const next = decodeSettingsPreferences(JSON.stringify(change(current.current)));
      await AsyncStorage.setItem(SETTINGS_PREFERENCES_KEY, JSON.stringify(next));
      current.current = next; if (mounted.current) { setData(next); setError(''); }
    } finally { flight.current = false; }
  }, []);
  return { data, loading, error, retry: load, save };
}
