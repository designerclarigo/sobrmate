/**
 * Radii tokens - 20-24px rounded cards for calm modern wellness feel
 */
export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,     // 20px
  card: 22,   // 22px standard for cards
  xxl: 24,    // 24px
  sheet: 28,  // 28px for modal and bottom sheets
  pill: 9999, // Pill for chips and rounded buttons
  full: 9999,
} as const;

export type RadiiTokens = typeof radii;
