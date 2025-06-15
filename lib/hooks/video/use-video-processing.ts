import { useState } from 'react';

interface UseVideoProcessingResult {
  processVideo: (videoId: string, youtubeId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
  progress: number;
}

interface SubtitleEntry {
  text: string;
  start: number;
  duration: number;
}

export function useVideoProcessing(): UseVideoProcessingResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const fetchSubtitles = async (
    youtubeId: string
  ): Promise<SubtitleEntry[]> => {
    try {
      setProgress(20);
      const response = await fetch('/api/videos/subtitles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId: youtubeId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch subtitles');
      }

      const { subtitles } = await response.json();
      setProgress(50);
      return subtitles;
    } catch (err) {
      console.error('Subtitle fetch error:', err);
      throw new Error(
        'Failed to fetch subtitles: ' +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const updateVideoStatus = async (videoId: string, status: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update video status');
      }
    } catch (err) {
      throw new Error(
        'Failed to update video status: ' +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const saveSubtitles = async (videoId: string, subtitles: SubtitleEntry[]) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/summaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subtitles }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save subtitles');
      }
    } catch (err) {
      throw new Error(
        'Failed to save subtitles: ' +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const processVideo = async (videoId: string, youtubeId: string) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

     
      await updateVideoStatus(videoId, 'processing');

      setProgress(10);

      const subtitles = await fetchSubtitles(youtubeId);

      setProgress(60);

      await saveSubtitles(videoId, subtitles);

      setProgress(80);

   
      await updateVideoStatus(videoId, 'completed');

      setProgress(100);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to process video')
      );
     
      await updateVideoStatus(videoId, 'failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    processVideo,
    loading,
    error,
    progress,
  };
}
