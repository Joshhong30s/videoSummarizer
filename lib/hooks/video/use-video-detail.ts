import { useEffect, useState, useCallback } from 'react';
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
      
      const response = await fetch(`/api/videos/${videoId}/detail`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch video details');
      }
      
      const data = await response.json();
      setVideo(data);
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
