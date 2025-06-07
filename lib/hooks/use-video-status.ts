import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { VideoDetail } from '@/lib/types';

export function useVideoStatus(videoId: string) {
  const [status, setStatus] = useState<VideoDetail['status']>('pending');

  useEffect(() => {
    // Get initial status
    supabase
      .from('videos')
      .select('status')
      .eq('id', videoId)
      .single()
      .then(({ data }) => {
        if (data) {
          setStatus(data.status);
        }
      });

    // Subscribe to changes
    const channel = supabase
      .channel(`video-${videoId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'videos',
          filter: `id=eq.${videoId}`,
        },
        payload => {
          const newStatus = (payload.new as VideoDetail).status;
          setStatus(newStatus);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [videoId]);

  return status;
}
