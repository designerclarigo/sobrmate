import React, { createContext } from 'react';
import { useIsFocused } from 'expo-router';

export const ScreenVisibilityContext = createContext(true);

/** Native tab scenes handle visibility; this context only pauses their clocks/sheets. */
export function FocusedTabContent({ children }: { children:React.ReactNode }) {
  const focused = useIsFocused();
  return <ScreenVisibilityContext.Provider value={focused}>{children}</ScreenVisibilityContext.Provider>;
}
