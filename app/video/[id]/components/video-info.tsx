'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { IconButton, Tooltip } from '@/app/components';
import { VideoStatsContainer } from './video-stats';
import { VideoMetadata } from './video-metadata';
import type { VideoDetail } from '@/lib/types';

interface VideoInfoProps {
  video: VideoDetail;
  className?: string;
}

export function VideoInfo({ video, className = '' }: VideoInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(video.youtube_id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy video ID:', err);
    }
  }, [video.youtube_id]);

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-6">
        <div className="flex-1 min-w-0">
          <VideoMetadata video={video} className="mb-4" />

          <div className="flex items-center gap-4">
            <Tooltip content="Open in YouTube">
              <a
                href={`https://youtube.com/watch?v=${video.youtube_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full transition-colors"
              >
                <span>View on YouTube</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Tooltip>
          </div>
        </div>

        <IconButton
          icon={ChevronDown}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex-shrink-0 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
        />
      </div>

      <VideoStatsContainer
        video={video}
        expanded={isExpanded}
        isCopied={isCopied}
        onCopyId={handleCopyId}
      />
    </div>
  );
}
