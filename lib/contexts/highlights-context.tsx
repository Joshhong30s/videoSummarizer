'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useHighlights } from '@/lib/hooks/video/use-highlights';
import type { Highlight, HighlightCreate } from '@/lib/types/core';

interface HighlightsContextType {
  highlights: Highlight[];
  loading: boolean;
  error: Error | null;
  addHighlight: (input: HighlightCreate) => Promise<Highlight>;
  removeHighlight: (id: string) => Promise<void>;
  updateHighlight: (
    id: string,
    updates: Partial<Highlight>
  ) => Promise<Highlight>;
}

const HighlightsContext = createContext<HighlightsContextType | null>(null);

interface HighlightsProviderProps {
  children: ReactNode;
  videoId: string;
}

export function HighlightsProvider({
  children,
  videoId,
}: HighlightsProviderProps) {
  const {
    highlights,
    loading,
    error,
    addHighlight,
    removeHighlight,
    updateHighlight,
  } = useHighlights({ videoId });

  return (
    <HighlightsContext.Provider
      value={{
        highlights,
        loading,
        error,
        addHighlight,
        removeHighlight,
        updateHighlight,
      }}
    >
      {children}
    </HighlightsContext.Provider>
  );
}

export function useHighlightsContext() {
  const context = useContext(HighlightsContext);
  if (!context) {
    throw new Error(
      'useHighlightsContext must be used within a HighlightsProvider'
    );
  }
  return context;
}
