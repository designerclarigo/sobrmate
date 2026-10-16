import { View } from 'react-native';
import { YearCardOptions } from './yearCard';
import { exportNativeImage } from './nativeImage';
export function exportYearCard(options: YearCardOptions, target: View | null, share: boolean): Promise<string> {
  return exportNativeImage(target, `komorebi-year-${options.year}-${options.format}.png`, !share, 1080, options.format === 'story' ? 1920 : 1350);
}
