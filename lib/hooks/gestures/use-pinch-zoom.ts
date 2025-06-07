import { useCallback, useRef, useState } from 'react';

interface PinchZoomOptions {
  onZoomChange?: (scale: number) => void;
  onZoomEnd?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
}

export function usePinchZoom({
  onZoomChange,
  onZoomEnd,
  minScale = 0.5,
  maxScale = 3,
  initialScale = 1,
}: PinchZoomOptions = {}) {
  const [scale, setScale] = useState(initialScale);
  const startDistance = useRef<number>(0);
  const startScale = useRef<number>(initialScale);

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (e.touches.length !== 2) return;

      e.preventDefault();
      startDistance.current = getDistance(e.touches[0], e.touches[1]);
      startScale.current = scale;
    },
    [scale]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (e.touches.length !== 2) return;

      e.preventDefault();

      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scaleDiff = currentDistance / startDistance.current;
      let newScale = startScale.current * scaleDiff;

      newScale = Math.max(minScale, Math.min(maxScale, newScale));

      setScale(newScale);
      onZoomChange?.(newScale);
    },
    [minScale, maxScale, onZoomChange, startDistance, startScale]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (e.touches.length !== 2) {
        onZoomEnd?.(scale);
      }
    },
    [scale, onZoomEnd]
  );

  return {
    scale,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    setScale,
  };
}
