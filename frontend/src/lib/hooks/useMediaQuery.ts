'use client';

import { useEffect, useState } from 'react';

/**
 * Track a CSS media query from React. Returns `false` during SSR / first paint
 * to avoid hydration mismatch — caller should treat the initial value as
 * "unknown" if hiding/showing UI conditionally on it.
 *
 * Example: const isMobile = useMediaQuery('(max-width: 767px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mql = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Set initial value after mount (SSR-safe).
    setMatches(mql.matches);

    // Subscribe. addEventListener is the modern API; addListener is the legacy
    // fallback for old Safari.
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, [query]);

  return matches;
}

/** Convenience: < 768px. Matches Tailwind's `md:` breakpoint. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
