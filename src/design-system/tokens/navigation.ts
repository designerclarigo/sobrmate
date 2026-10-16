/** Measured from the published SobrMate bottom navigation. */
export const navigationColors = {
  canvas: '#FAF9F6', border: '#EBE3EE', active: '#806499', inactive: '#A08AAF',
  indicator: '#EEE6F5', hover: '#F3EDF7', focus: '#B6A4D0',
} as const;

export const navigationMetrics = {
  maxWidth: 400, gutter: 16, gap: 4, paddingTop: 8, minimumBottomPadding: 14,
  tabHeight: 50, tabRadius: 14, iconSize: 19, iconStroke: 1.65,
  indicatorWidth: 35, indicatorHeight: 27, indicatorRadius: 10,
  labelSize: 12, labelLineHeight: 18, labelTracking: 0.1,
  stateDuration: 200, pressDuration: 140, screenDuration: 160,
} as const;
