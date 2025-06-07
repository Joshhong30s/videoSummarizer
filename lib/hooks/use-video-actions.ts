import { useState } from 'react';
import { supabase } from '../supabase';
import type { VideoDetail } from '@/lib/types';

interface UseVideoActionsResult {
  retryProcessing: (videoId: string) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  updateCategories: (videoId: string, categoryIds: string[]) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useVideoActions(): UseVideoActionsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const retryProcessing = async (videoId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('videos')
        .update({
          status: 'pending',
          summary: null, // Clear previous summary data
        })
        .eq('id', videoId);

      if (updateError) {
        throw updateError;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to retry video processing')
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete video');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to delete video')
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategories = async (videoId: string, categoryIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_ids: categoryIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '更新分類失敗');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('更新分類失敗'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    retryProcessing,
    deleteVideo,
    updateCategories,
    loading,
    error,
  };
}
