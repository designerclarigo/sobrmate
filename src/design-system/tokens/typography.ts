// Hierarchy comes from size, spacing, and color before additional weight.
export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const fontFamilies = {
  serif: 'Georgia',
  sans: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

export const typography = {
  displayLarge: {
    fontFamily: fontFamilies.serif,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: fontWeights.regular,
    letterSpacing: -0.6,
  },
  display: {
    fontFamily: fontFamilies.serif,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: fontWeights.regular,
    letterSpacing: -0.4,
  },
  title1: {
    fontFamily: fontFamilies.sans,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: fontWeights.regular,
    letterSpacing: -0.2,
  },
  title2: {
    fontFamily: fontFamilies.medium,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: fontWeights.medium,
    letterSpacing: -0.1,
  },
  title3: {
    fontFamily: fontFamilies.sans,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: fontWeights.medium,
    letterSpacing: -0.1,
  },
  bodyLarge: {
    fontFamily: fontFamilies.sans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.regular,
  },
  body: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: fontWeights.regular,
  },
  bodyMedium: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: fontWeights.medium,
  },
  caption: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },
  subcaption: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.5,
  },
  counter: {
    fontFamily: fontFamilies.serif,
    fontSize: 54,
    lineHeight: 60,
    fontWeight: fontWeights.regular,
    letterSpacing: -1,
  },
  tabularMetric: {
    fontFamily: fontFamilies.sans,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: fontWeights.medium,
    letterSpacing: -0.3,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
