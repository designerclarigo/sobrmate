import {localWorkspaceKey} from '../../data/workspace';
export const ideaCategories = ['Experience', 'Tracking', 'Milestones', 'Accessibility', 'Other'] as const;
export type IdeaCategory = typeof ideaCategories[number];
export interface FeatureDraft { id: string; category: IdeaCategory; title: string; details: string }
export interface SettingsPreferences {
  version: 1;
  widgetStyle: 'minimal' | 'detailed';
  rating: number;
  feedback: string;
  featureDrafts: FeatureDraft[];
}
export const SETTINGS_PREFERENCES_KEY = localWorkspaceKey('@komorebi:settings-preferences:v1');
export const emptySettingsPreferences = (): SettingsPreferences => ({ version: 1, widgetStyle: 'minimal', rating: 0, feedback: '', featureDrafts: [] });

export function decodeSettingsPreferences(raw: string | null): SettingsPreferences {
  if (raw === null) return emptySettingsPreferences();
  try {
    const data = JSON.parse(raw);
    if (data.version !== 1 || !['minimal', 'detailed'].includes(data.widgetStyle) || !Number.isInteger(data.rating) || data.rating < 0 || data.rating > 5 || typeof data.feedback !== 'string' || data.feedback.length > 1000 || !Array.isArray(data.featureDrafts) || data.featureDrafts.length > 30) throw new Error();
    const ids = new Set<string>();
    for (const draft of data.featureDrafts) {
      if (!draft || typeof draft.id !== 'string' || !draft.id || ids.has(draft.id) || !ideaCategories.includes(draft.category) || typeof draft.title !== 'string' || !draft.title.trim() || draft.title.length > 100 || typeof draft.details !== 'string' || draft.details.length > 2000) throw new Error();
      ids.add(draft.id);
    }
    return data as SettingsPreferences;
  } catch { throw new Error('Your Settings drafts could not be read. The saved copy has been kept. Please retry.'); }
}

export function saveFeatureDraft(preferences: SettingsPreferences, draft: FeatureDraft): SettingsPreferences {
  const title = draft.title.trim(), details = draft.details.trim();
  if (title.length < 3 || details.length < 10) throw new Error('Add a title of at least 3 characters and details of at least 10 characters.');
  if (title.length > 100 || details.length > 2000 || !draft.id || !ideaCategories.includes(draft.category)) throw new Error('Please review the idea before saving.');
  if (!preferences.featureDrafts.some(item => item.id === draft.id) && preferences.featureDrafts.length >= 30) throw new Error('You have 30 drafts. Edit an existing draft to keep developing an idea.');
  return { ...preferences, featureDrafts: [{ ...draft, title, details }, ...preferences.featureDrafts.filter(item => item.id !== draft.id)] };
}

export function validateProfile(name: string, email: string) {
  const userName = name.trim(), userEmail = email.trim();
  // Keep support for existing 60-character native profiles.
  if (!userName || userName.length > 60) throw new Error('Use a display name between 1 and 60 characters.');
  if (userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) throw new Error('Enter a valid email or leave it blank.');
  return { userName, userEmail };
}

export function reminderTime(hour: string, minute: string) {
  if (!/^\d{1,2}$/.test(hour) || !/^\d{1,2}$/.test(minute) || Number(hour) > 23 || Number(minute) > 59) throw new Error('Choose a time from 00:00 to 23:59.');
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}
