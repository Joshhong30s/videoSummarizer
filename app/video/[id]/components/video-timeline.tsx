'use client';

import { useCallback, useEffect, useState } from 'react';
import { useVideoPlayer } from '@/lib/contexts/video-player-context';
import { formatTime } from '@/lib/utils/format-time';
import { Slider } from '@/app/components/ui/slider';

interface TimelineProps {
  className?: string;
}

export function VideoTimeline({ className }: TimelineProps) {
  const { currentTime, duration, seek } = useVideoPlayer();
  const [value, setValue] = useState<number[]>([0]);

  useEffect(() => {
    setValue([currentTime]);
  }, [currentTime]);

  const handleSliderChange = useCallback((newValue: number[]) => {
    setValue(newValue);
  }, []);

  const handleSliderChangeEnd = useCallback(
    (newValue: number[]) => {
      seek(newValue[0]);
    },
    [seek]
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <span className="min-w-[4rem] text-sm text-gray-500">
          {formatTime(currentTime)}
        </span>
        <Slider
          min={0}
          max={duration}
          step={0.1}
          value={value}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderChangeEnd}
          className="flex-1"
        />
        <span className="min-w-[4rem] text-sm text-gray-500">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
