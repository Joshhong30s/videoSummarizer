import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { VideoListItem, VideoSummary } from '@/lib/types';

interface VideoDetail extends VideoListItem {
  summary?: VideoSummary | null;
}

export function useVideoDetail(videoId: string) {
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVideoDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (videoError) throw videoError;

      if (!videoData) {
        throw new Error('Video not found');
      }

      const { data: summaryData, error: summaryError } = await supabase
        .from('summaries')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (summaryError && summaryError.code !== 'PGRST116') {
        throw summaryError;
      }

      setVideo({
        ...videoData,
        summary: summaryData,
      });
    } catch (err) {
      console.error('Error fetching video details:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to fetch video details')
      );
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;
    fetchVideoDetail();
  }, [videoId, fetchVideoDetail]);

  return {
    video,
    loading,
    error,
    refetch: fetchVideoDetail,
  };
}
