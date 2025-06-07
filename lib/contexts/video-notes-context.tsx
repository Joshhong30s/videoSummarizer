'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { Note } from '@/lib/types/database';
import { supabase } from '@/lib/supabase';

interface VideoNotesContextType {
  notes: Note[];
  loading: boolean;
  error: Error | null;
  addNote: (content: string, timestamp?: number) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
}

const VideoNotesContext = createContext<VideoNotesContextType | null>(null);

interface VideoNotesProviderProps {
  children: React.ReactNode;
  videoId: string;
}

const REFRESH_INTERVAL = 5000; // 5 seconds

export function VideoNotesProvider({
  children,
  videoId,
}: VideoNotesProviderProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('video_notes')
        .select('*')
        .eq('video_id', videoId)
        .order('timestamp', { ascending: true, nullsFirst: false });

      if (fetchError) throw fetchError;
      setNotes(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch notes'));
    }
  }, [videoId]);

  // Initial fetch
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setLoading(true);
        await fetchNotes();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [fetchNotes]);

  // Auto refresh
  useEffect(() => {
    const intervalId = setInterval(fetchNotes, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchNotes]);

  const addNote = useCallback(
    async (content: string, timestamp?: number) => {
      try {
        const { data, error } = await supabase
          .from('video_notes')
          .insert([{ video_id: videoId, content, timestamp }])
          .select()
          .single();

        if (error) throw error;

        setNotes(prev => {
          const newNotes = [...prev, data];
          return newNotes.sort((a, b) => {
            if (!a.timestamp && !b.timestamp) return 0;
            if (!a.timestamp) return 1;
            if (!b.timestamp) return -1;
            return a.timestamp - b.timestamp;
          });
        });

        return data;
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to add note');
      }
    },
    [videoId]
  );

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      const { data, error } = await supabase
        .from('video_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => {
        const updated = prev.map(note => (note.id === id ? data : note));
        return updated.sort((a, b) => {
          if (!a.timestamp && !b.timestamp) return 0;
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return a.timestamp - b.timestamp;
        });
      });

      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update note');
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('video_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete note');
    }
  }, []);

  const value = {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    refreshNotes: fetchNotes,
  };

  return (
    <VideoNotesContext.Provider value={value}>
      {children}
    </VideoNotesContext.Provider>
  );
}

export function useVideoNotes() {
  const context = useContext(VideoNotesContext);
  if (!context) {
    throw new Error('useVideoNotes must be used within a VideoNotesProvider');
  }
  return context;
}
