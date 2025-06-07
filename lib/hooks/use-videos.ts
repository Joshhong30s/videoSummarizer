import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { VideoListItem } from '../types';

export function useVideos() {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setVideos(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch videos')
        );
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();

    // Subscribe to changes
    const channel = supabase
      .channel('videos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos',
        },
        async () => {
          // Refetch videos when there's a change
          const { data } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });

          setVideos(data || []);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { videos, loading, error };
}
