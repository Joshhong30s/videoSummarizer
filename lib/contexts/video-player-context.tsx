'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  VideoState,
  PlayerControls,
  VideoEventCallback,
} from '@/lib/types/video';
import ReactPlayer from 'react-player';

interface VideoPlayerContextType extends VideoState, PlayerControls {
  playerRef: React.RefObject<ReactPlayer>;
  subscribe: (callback: VideoEventCallback) => () => void;
  updateState: (updates: Partial<VideoState>) => void;
  seekTo: (time: number) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

const defaultState: VideoState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  playbackRate: 1,
  isMuted: false,
  isFullscreen: false,
};

export function VideoPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const playerRef = useRef<ReactPlayer>(null);
  const [state, setState] = useState<VideoState>(defaultState);
  const subscribers = useRef<Set<VideoEventCallback>>(new Set());

  const notifySubscribers = useCallback((newState: VideoState) => {
    subscribers.current.forEach(callback => callback(newState));
  }, []);

  const updateState = useCallback(
    (updates: Partial<VideoState>) => {
      setState(prev => {
        const newState = { ...prev, ...updates };
        notifySubscribers(newState);
        return newState;
      });
    },
    [notifySubscribers]
  );

  const play = async () => {
    updateState({ isPlaying: true });
  };

  const pause = () => {
    updateState({ isPlaying: false });
  };

  const seek = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time);
      updateState({ currentTime: time });
    }
  };

  const setVolume = (volume: number) => {
    if (playerRef.current) {
      playerRef.current.getInternalPlayer().volume = volume;
      updateState({ volume, isMuted: volume === 0 });
    }
  };

  const setPlaybackRate = (rate: number) => {
    if (playerRef.current) {
      playerRef.current.getInternalPlayer().playbackRate = rate;
      updateState({ playbackRate: rate });
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer();
      const newMuted = !player.muted;
      player.muted = newMuted;
      updateState({ isMuted: newMuted });
    }
  };

  const toggleFullscreen = () => {
    const element = document.querySelector('.react-player');
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen();
      updateState({ isFullscreen: true });
    } else {
      document.exitFullscreen();
      updateState({ isFullscreen: false });
    }
  };

  const subscribe = useCallback((callback: VideoEventCallback) => {
    subscribers.current.add(callback);
    return () => {
      subscribers.current.delete(callback);
    };
  }, []);

  const value: VideoPlayerContextType = {
    ...state,
    playerRef,
    updateState,
    subscribe,
    play,
    pause,
    seek,
    seekTo: seek,
    setVolume,
    setPlaybackRate,
    toggleMute,
    toggleFullscreen,
  };

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayer() {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
}
