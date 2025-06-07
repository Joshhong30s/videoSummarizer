'use client';

import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { IconButton, Tooltip, SkeletonContainer } from '@/app/components';
import type { VideoDetail } from '@/lib/types';

interface VideoStatsProps {
  video: VideoDetail;
  isCopied: boolean;
  onCopyId: () => void;
}

export function VideoStats({ video, isCopied, onCopyId }: VideoStatsProps) {
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Video ID</dt>
          <dd className="group mt-1 flex items-center gap-2 text-sm text-gray-900">
            <span className="truncate">{video.youtube_id}</span>
            <Tooltip content="Open in YouTube">
              <a
                href={`https://youtube.com/watch?v=${video.youtube_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <span>View on YouTube</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Tooltip>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Added On</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {new Date(video.created_at).toLocaleDateString()}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {new Date(video.updated_at).toLocaleDateString()}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Status</dt>
          <dd className="mt-1 flex items-center gap-2 text-sm text-gray-900">
            <span>{video.summary ? 'Complete' : 'Processing'}</span>
            {video.summary && (
              <span className="inline-flex rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
                ✓
              </span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}

interface VideoStatsContainerProps extends VideoStatsProps {
  expanded: boolean;
}

export function VideoStatsContainer({
  expanded,
  ...props
}: VideoStatsContainerProps) {
  const variants = {
    expanded: {
      height: 'auto',
      opacity: 1,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.3 },
      },
    },
    collapsed: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.2 },
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="collapsed"
      animate={expanded ? 'expanded' : 'collapsed'}
      className="overflow-hidden"
    >
      <SkeletonContainer>
        <VideoStats {...props} />
      </SkeletonContainer>
    </motion.div>
  );
}
