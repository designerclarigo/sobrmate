import { useCallback, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

/** Size rows from their actual container, including nested cards and sheets. */
export function useResponsiveRow(columns = 2, minimumColumnWidth = 140, gap = 12) {
  const { width, fontScale } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const onLayout = useCallback(({ nativeEvent }: LayoutChangeEvent) => {
    const next = nativeEvent.layout.width;
    if (next > 0) setMeasuredWidth(previous => previous === next ? previous : next);
  }, []);
  const availableWidth = measuredWidth ?? Math.max(0, Math.min(width, 440) - 40);
  return { onLayout, stacked: availableWidth < columns * minimumColumnWidth * Math.max(1, fontScale) + (columns - 1) * gap };
}
