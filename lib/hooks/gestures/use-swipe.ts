import { useCallback, useRef, useState } from 'react';
import type { TouchEvent } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  threshold?: number;
  preventScroll?: boolean;
  preventDefaultTouchMove?: boolean;
}

export function useSwipe(handlers: SwipeHandlers, options: SwipeOptions = {}) {
  const {
    threshold = 50,
    preventScroll = false,
    preventDefaultTouchMove = false,
  } = options;

  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent<HTMLElement>) => {
      if (preventDefaultTouchMove) {
        e.preventDefault();
      }
      if (preventScroll) {
        e.stopPropagation();
      }
    },
    [preventDefaultTouchMove, preventScroll]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent<HTMLElement>) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      const deltaTime = Date.now() - touchStart.current.time;

      if (deltaTime > 300) {
        setSwiping(false);
        return;
      }

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY) {
        if (absX > threshold) {
          if (deltaX > 0) {
            handlers.onSwipeRight?.();
          } else {
            handlers.onSwipeLeft?.();
          }
        }
      } else {
        if (absY > threshold) {
          if (deltaY > 0) {
            handlers.onSwipeDown?.();
          } else {
            handlers.onSwipeUp?.();
          }
        }
      }

      setSwiping(false);
    },
    [handlers, threshold]
  );

  const handleTouchCancel = useCallback(() => {
    setSwiping(false);
  }, []);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
    swiping,
  };
}
