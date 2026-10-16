import { HabitCategory } from './types';

export const HABIT_CATEGORIES: readonly HabitCategory[] = [
  'substance', 'digital', 'behavior', 'financial', 'mindfulness', 'custom',
];

const catalogCategories: Record<string, HabitCategory> = {
  alcohol: 'substance',
  nicotine: 'substance',
  substances: 'substance',
  behavioral: 'behavior',
};

/** Catalog groups from earlier app versions map to the persisted category schema. */
export function normalizeHabitCategory(value: unknown): HabitCategory | null {
  if (typeof value !== 'string') return null;
  if (HABIT_CATEGORIES.includes(value as HabitCategory)) return value as HabitCategory;
  return Object.prototype.hasOwnProperty.call(catalogCategories, value) ? catalogCategories[value] : null;
}
