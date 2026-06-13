'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook that syncs state with localStorage.
 * Survives page refreshes and falls back to in-memory state when
 * window is unavailable (SSR) or storage is full.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // Corrupt value — fall through to default.
    }
    return defaultValue;
  });

  // Sync to localStorage whenever state changes.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — silently ignore; state stays in memory.
    }
  }, [key, state]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        return next;
      });
    },
    [],
  );

  return [state, setValue];
}
