'use client';

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from 'react';
import { VideoListItem } from '@/lib/types';
import { useSession } from 'next-auth/react';
import { GUEST_USER_ID } from '@/lib/supabase';

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
  const { data: session, status } = useSession();
  const fetchingRef = useRef(false);

  const refetch = useCallback(async () => {
    // 避免重複的請求
    if (fetchingRef.current) {
      console.log('Already fetching videos, skipping...');
      return;
    }

    // 如果 session 還在初始化，等待
    if (status === 'loading') {
      console.log('Session is loading, waiting...');
      return;
    }

    console.log('Session status:', session ? 'Logged in' : 'Guest');
    const userId = session?.user?.id || GUEST_USER_ID;
    console.log('Fetching videos for userId:', userId);

    try {
      fetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/videos?userId=${userId}`);
      console.log('API response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const { data } = await response.json();
      console.log(`Fetched ${data?.length || 0} videos`);

      // 只在成功獲取新數據時更新
      if (data) {
        setVideos(data);
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch videos'));
      // 保持舊數據不變
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [session, status]);

  const updateVideo = useCallback((id: string, updates: Partial<VideoListItem>) => {
    setVideos(prev =>
      prev.map(video => (video.id === id ? { ...video, ...updates } : video))
    );
  }, []);

  const deleteVideo = useCallback((id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id));
  }, []);

  // 初始化和 session 變化時獲取數據
  useEffect(() => {
    // session 已就緒且不在載入中時才獲取
    if (status !== 'loading') {
      console.log('Initializing videos fetch...');
      refetch();
    }
  }, [refetch, status]);

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
