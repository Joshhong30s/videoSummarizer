import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Highlight } from '@/lib/types/database';
import type { UIHighlight } from '@/lib/types/video';
import type { HighlightCreate } from '@/lib/types/core';

// hooks/video/use-highlights.ts
export function useHighlights({ videoId }: { videoId: string }) {
  const [highlights, setHighlights] = useState<UIHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Example API
  const addHighlight = async (input: HighlightCreate): Promise<Highlight> => {
    try {
      const res = await fetch(`/api/videos/${videoId}/highlights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create highlight');
      }

      const newHighlight = await res.json();
      setHighlights(prev => [...prev, newHighlight]);
      return newHighlight;
    } catch (err) {
      console.error('Failed to create highlight:', err);
      throw err;
    }
  };

  const updateHighlight = async (
    id: string,
    updates: Partial<Highlight>
  ): Promise<Highlight> => {
    try {
      const res = await fetch(`/api/videos/${videoId}/highlights/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update highlight');
      }

      const updated = await res.json();
      setHighlights(prev =>
        prev.map(h => (h.id === id ? { ...h, ...updated } : h))
      );
      return updated;
    } catch (err) {
      console.error('Failed to update highlight:', err);
      throw err;
    }
  };

  const removeHighlight = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/videos/${videoId}/highlights/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete highlight');
      }

      setHighlights(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error('Failed to delete highlight:', err);
      throw err;
    }
  };

  // Fetch on mount
  useEffect(() => {
    async function fetchHighlights() {
      try {
        const res = await fetch(`/api/videos/${videoId}/highlights`);
        const data = await res.json();
        setHighlights(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchHighlights();
  }, [videoId]);

  return {
    highlights,
    loading,
    error,
    addHighlight,
    removeHighlight,
    updateHighlight,
  };
}
