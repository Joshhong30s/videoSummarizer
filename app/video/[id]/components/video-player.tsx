'use client';

import { useCallback, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useVideoPlayer } from '@/lib/contexts/video-player-context';
import { useHighlightsContext } from '@/lib/contexts/highlights-context';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatTime } from '@/lib/utils/format-time';

interface VideoPlayerProps {
  videoId: string;
  videoDbId: string;
  className?: string;
}

export function VideoPlayer({ 
  videoId, 
  videoDbId,
  className 
}: VideoPlayerProps) {
  const { playerRef, isPlaying, updateState, currentTime, duration } = useVideoPlayer();
  const { highlights } = useHighlightsContext();
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, 'seconds');
    }
  };

  const togglePlay = () => {
    updateState({ isPlaying: !isPlaying });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isPlaying && !isHovering) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else {
      setShowControls(true);
    }

    return () => clearTimeout(timeout);
  }, [isPlaying, isHovering]);

  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden bg-black rounded-t-xl',
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={() => setShowControls(true)}
    >
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={isPlaying}
        volume={isMuted ? 0 : volume}
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
              controls: 0, // Hide YouTube controls
            },
          },
        }}
      />

      {/* Custom Controls Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
      >
        {/* Top gradient for better visibility */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />

        {/* Center play button */}
        {!isPlaying && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </motion.button>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress bar with highlights */}
          <div className="relative group">
            <div
              className="relative h-1 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all"
              onClick={handleSeek}
            >
              {/* Buffered progress */}
              <div className="absolute inset-0 bg-white/30 rounded-full" />
              
              {/* Played progress */}
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />

              {/* Highlights markers */}
              {highlights.map((highlight) => {
                const position = (highlight.start_offset / duration) * 100;
                return (
                  <div
                    key={highlight.id}
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-yellow-400 rounded-full opacity-80"
                    style={{ left: `${position}%` }}
                    title={highlight.content}
                  />
                );
              })}

              {/* Hover time tooltip */}
              <div className="absolute -top-8 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                {formatTime(currentTime)}
              </div>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-white/80 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" fill="white" />
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
                
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    setIsMuted(newVolume === 0);
                  }}
                  className="w-0 group-hover:w-20 transition-all duration-300 opacity-0 group-hover:opacity-100"
                />
              </div>

              {/* Time display */}
              <div className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Settings */}
              <button className="text-white hover:text-white/80 transition-colors">
                <Settings className="w-6 h-6" />
              </button>

              {/* Fullscreen */}
              <button 
                onClick={() => {
                  const player = playerRef.current?.getInternalPlayer();
                  if (player?.requestFullscreen) {
                    player.requestFullscreen();
                  }
                }}
                className="text-white hover:text-white/80 transition-colors"
              >
                <Maximize className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}