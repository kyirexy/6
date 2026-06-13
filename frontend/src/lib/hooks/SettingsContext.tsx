'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  type UserSettings,
  type CardStyle,
  type DensityLevel,
  DEFAULT_USER_SETTINGS,
} from '@/lib/types';

interface SettingsContextValue {
  settings: UserSettings;
  updateStyle: (style: CardStyle) => void;
  updateDensity: (density: DensityLevel) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    'videocapsule-settings',
    DEFAULT_USER_SETTINGS,
  );

  const updateStyle = useCallback(
    (style: CardStyle) => setSettings((prev) => ({ ...prev, cardStyle: style })),
    [setSettings],
  );

  const updateDensity = useCallback(
    (density: DensityLevel) => setSettings((prev) => ({ ...prev, density })),
    [setSettings],
  );

  const resetSettings = useCallback(
    () => setSettings(DEFAULT_USER_SETTINGS),
    [setSettings],
  );

  return (
    <SettingsContext.Provider value={{ settings, updateStyle, updateDensity, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a <SettingsProvider>');
  }
  return ctx;
}
