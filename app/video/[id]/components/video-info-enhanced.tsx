'use client';

import { Calendar, Clock, ExternalLink } from 'lucide-react';
import type { VideoDetail } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/app/components/ui/button';

interface VideoInfoEnhancedProps {
  video: VideoDetail;
  className?: string;
}

export function VideoInfoEnhanced({
  video,
  className = '',
}: VideoInfoEnhancedProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className={cn(
        'glass-dark rounded-xl p-4 transition-all duration-300',
        className
      )}
    >
      <div className="space-y-3">
        {/* Title and basic info */}
        <div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            {video.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(video.published_at || video.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {video.metadata?.duration || 'N/A'}
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex gap-2">
          <a
            href={`https://youtube.com/watch?v=${video.youtube_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
