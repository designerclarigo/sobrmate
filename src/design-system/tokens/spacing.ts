/**
 * Consistent 8px Spacing Grid
 */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,      // Half unit for tight padding
  sm: 8,      // 8px base
  md: 12,     // Intermediate
  base: 16,   // 2 * 8px
  lg: 20,     // Intermediate
  xl: 24,     // 3 * 8px
  xxl: 32,    // 4 * 8px
  xxxl: 40,   // 5 * 8px
  huge: 48,   // 6 * 8px
  massive: 64 // 8 * 8px
} as const;

export type SpacingTokens = typeof spacing;
