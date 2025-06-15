'use client';

import { useEffect } from 'react';
import { useVideos } from '@/lib/hooks/use-videos';

interface VideoSidebarProps {
  video_id: string; // Use video_id instead of videoId to match database naming
}

export function VideoSidebar({ video_id }: VideoSidebarProps) {
  const { videos, loading, error } = useVideos();

  const relatedVideos = videos?.filter(v => v.id !== video_id) || [];

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-gray-200"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-gray-500">
        Failed to load related videos
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {relatedVideos.length === 0 ? (
        <div className="text-center text-gray-500">No related videos found</div>
      ) : (
        relatedVideos.map(video => (
          <div
            key={video.id}
            className="flex space-x-4 rounded-lg border border-gray-200 p-4"
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{video.title}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(video.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
