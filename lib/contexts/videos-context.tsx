'use client';

import { createContext, useContext, useCallback, useState } from 'react';
import { VideoListItem } from '@/lib/types';

interface VideosContextType {
  videos: VideoListItem[];
  setVideos: (videos: VideoListItem[]) => void;
  isLoading: boolean;
  error: Error | null;
  updateVideo: (id: string, updates: Partial<VideoListItem>) => void;
  deleteVideo: (id: string) => void;
  refetch: () => Promise<void>;
}

interface VideosProviderProps {
  children: React.ReactNode;
  initialVideos?: VideoListItem[];
}

const VideosContext = createContext<VideosContextType>({
  videos: [],
  setVideos: () => {},
  isLoading: false,
  error: null,
  updateVideo: () => {},
  deleteVideo: () => {},
  refetch: async () => {},
});

export function VideosProvider({
  children,
  initialVideos = [],
}: VideosProviderProps) {
  const [videos, setVideos] = useState<VideoListItem[]>(initialVideos);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/videos');
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const { data } = await response.json();
      setVideos(data || []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch videos')
      );
      console.error('Error fetching videos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateVideo = useCallback(
    (id: string, updates: Partial<VideoListItem>) => {
      setVideos(prev =>
        prev.map(video => (video.id === id ? { ...video, ...updates } : video))
      );
    },
    []
  );

  const deleteVideo = useCallback((id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id));
  }, []);

  return (
    <VideosContext.Provider
      value={{
        videos,
        setVideos,
        isLoading,
        error,
        updateVideo,
        deleteVideo,
        refetch,
      }}
    >
      {children}
    </VideosContext.Provider>
  );
}

export function useVideos() {
  const context = useContext(VideosContext);
  if (!context) {
    throw new Error('useVideos must be used within a VideosProvider');
  }
  return context;
}
