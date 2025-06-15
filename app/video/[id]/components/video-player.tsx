'use client';

import { useCallback } from 'react';
import ReactPlayer from 'react-player';
import { useVideoPlayer } from '@/lib/contexts/video-player-context';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoId: string;
  className?: string;
}

export function VideoPlayer({ videoId, className }: VideoPlayerProps) {
  const { playerRef, isPlaying, updateState } = useVideoPlayer();

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const onProgress = useCallback(
    (state: { played: number; playedSeconds: number; loaded: number }) => {
      updateState({
        currentTime: state.playedSeconds,
      });
    },
    [updateState]
  );

  const onDuration = useCallback(
    (duration: number) => {
      updateState({ duration });
    },
    [updateState]
  );

  const onPlay = useCallback(() => {
    updateState({ isPlaying: true });
  }, [updateState]);

  const onPause = useCallback(() => {
    updateState({ isPlaying: false });
  }, [updateState]);

  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-lg',
        className
      )}
    >
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={isPlaying}
        controls
        onPlay={onPlay}
        onPause={onPause}
        onProgress={onProgress}
        onDuration={onDuration}
        progressInterval={100}
        className="react-player"
        config={{
          youtube: {
            playerVars: {
              autoplay: 0,
              modestbranding: 1,
              rel: 0,
            },
          },
        }}
      />
    </div>
  );
}
