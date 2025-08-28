import Link from 'next/link';
import Image from 'next/image';
import { VideoCardSkeleton } from '@/app/components/video/video-card';
import type { VideoListItem } from '@/lib/types';
import { useVideos } from '@/lib/contexts/videos-context';

interface VideoSidebarProps {
  currentId?: string;
}

export function VideoSidebar({ currentId }: VideoSidebarProps) {
  const { videos, isLoading } = useVideos();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <VideoCardSkeleton />
        <VideoCardSkeleton />
        <VideoCardSkeleton />
      </div>
    );
  }

  // Filter out current video and take first 3
  const relatedVideos = videos
    .filter(video => video.id !== currentId)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {relatedVideos.map((video: VideoListItem) => (
        <Link
          key={video.id}
          href={`/video/${video.youtube_id}`}
          className="flex gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {/* Thumbnail */}
          <div className="relative w-24 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
            <Image
              src={
                video.thumbnail_url ||
                `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`
              }
              alt={video.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Video info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {video.title}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
