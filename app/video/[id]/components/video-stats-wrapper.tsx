'use client';

import { useState } from 'react';
import type { VideoDetail } from '@/lib/types';
import { VideoStats } from './video-stats';

interface VideoStatsWrapperProps {
  video: VideoDetail;
}

export function VideoStatsWrapper({ video }: VideoStatsWrapperProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(video.youtube_id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <VideoStats video={video} isCopied={isCopied} onCopyId={handleCopyId} />
  );
}
