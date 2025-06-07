import { useEffect, useCallback } from 'react';
import { useVideoPlayer } from '@/lib/contexts/video-player-context';

export function useVideoShortcuts() {
  const { seekTo, currentTime, duration, isPlaying, play, pause } =
    useVideoPlayer();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (isPlaying) {
            pause();
          } else {
            play();
          }
          break;

        case 'ArrowLeft':
          event.preventDefault();
          seekTo(Math.max(0, currentTime - 5)); // Rewind 5 seconds
          break;

        case 'ArrowRight':
          event.preventDefault();
          seekTo(Math.min(duration, currentTime + 5)); // Forward 5 seconds
          break;

        case 'KeyJ':
          event.preventDefault();
          seekTo(Math.max(0, currentTime - 10)); // Rewind 10 seconds
          break;

        case 'KeyL':
          event.preventDefault();
          seekTo(Math.min(duration, currentTime + 10)); // Forward 10 seconds
          break;

        case 'KeyK':
          event.preventDefault();
          if (isPlaying) {
            pause();
          } else {
            play();
          }
          break;

        case 'Home':
          event.preventDefault();
          seekTo(0); // Go to start
          break;

        case 'End':
          event.preventDefault();
          seekTo(duration); // Go to end
          break;

        default:
          break;
      }
    },
    [currentTime, duration, isPlaying, play, pause, seekTo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
