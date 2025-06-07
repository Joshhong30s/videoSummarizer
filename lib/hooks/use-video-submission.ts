import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getVideoId, getVideoInfo } from '@/lib/utils/youtube';
import { useVideos } from '@/lib/contexts/videos-context';

import { supabase } from '@/lib/supabase';

interface UseVideoSubmissionResult {
  submitVideo: (url: string, categoryIds?: string[]) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useVideoSubmission(): UseVideoSubmissionResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // const supabase = createClientComponentClient();

  const { refetch } = useVideos();
  const submitVideo = async (url: string, categoryIds?: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const videoId = getVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          category_ids: categoryIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add video');
      }

      // Refresh video list after successful addition
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error adding video'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitVideo,
    isLoading,
    error,
  };
}
