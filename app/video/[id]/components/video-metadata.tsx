'use client';

import type { VideoDetail } from '@/lib/types';
import { formatDuration } from '@/lib/utils/format-time';

interface VideoMetadataProps {
  video: VideoDetail;
  className?: string;
  showClassification?: boolean;
}

export function VideoMetadataCompact({
  video,
  className = '',
  showClassification = true,
}: VideoMetadataProps) {
  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
        {video.title}
      </h3>
      <div className="flex items-center gap-x-2 mt-1">
        <span className="text-xs text-gray-500">
          {new Date(
            video.published_at || video.created_at
          ).toLocaleDateString()}
        </span>
        {video.metadata?.duration && (
          <span className="text-xs text-gray-500">
            {formatDuration(video.metadata.duration)}
          </span>
        )}
      </div>
      {showClassification && video.summary?.classification && (
        <div className="flex flex-wrap gap-1 mt-2">
          {Object.entries(JSON.parse(video.summary.classification))
            .filter(([_, value]) => (value as number) > 0.5)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(([label, score]) => (
              <span
                key={label}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {label} ({Math.round((score as number) * 100)}%)
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

export function VideoMetadata({ video, className = '' }: VideoMetadataProps) {
  return (
    <div className={className}>
      <h1 className="text-2xl font-semibold text-gray-900">{video.title}</h1>
      <div className="flex items-center gap-x-4 mt-2">
        <span className="text-sm text-gray-600">
          Published{' '}
          {new Date(
            video.published_at || video.created_at
          ).toLocaleDateString()}
        </span>
        {video.metadata?.duration && (
          <span className="text-sm text-gray-600">
            {formatDuration(video.metadata.duration)}
          </span>
        )}
      </div>
      {video.summary?.classification && (
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(JSON.parse(video.summary.classification))
            .filter(([_, value]) => (value as number) > 0.5)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(([label, score]) => (
              <span
                key={label}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                {label} ({Math.round((score as number) * 100)}%)
              </span>
            ))}
        </div>
      )}
      {video.metadata?.notes && (
        <p className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">
          {video.metadata.notes}
        </p>
      )}
    </div>
  );
}
