'use client';

import { SettingsProvider } from '@/lib/hooks/SettingsContext';
import { ExtractionProvider } from '@/lib/hooks/ExtractionContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ExtractionProvider>{children}</ExtractionProvider>
    </SettingsProvider>
  );
}
