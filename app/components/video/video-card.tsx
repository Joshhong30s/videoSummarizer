'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Bookmark, Play, Clock } from 'lucide-react';
import { VideoListItem } from '@/lib/types/video';
import { CategoryTag } from '../ui/category-tag';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '../ui/skeleton';
import { useMemo } from 'react';
import { useCategories } from '@/lib/hooks/use-categories';

interface VideoCardProps {
  video: VideoListItem;
}

export interface VideoCardGridProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function VideoCardGrid({
  children,
  className,
  ...props
}: VideoCardGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="relative aspect-video">
        <Skeleton className="absolute inset-0" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Skeleton className="mb-2 h-4 w-3/4" />
        <Skeleton className="mb-2 h-4 w-1/2" />

        <div className="mt-auto flex items-center gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function VideoCard({ video }: VideoCardProps) {
  const { categories } = useCategories();

  const category = useMemo(() => {
    const categoryId = video.category_ids?.[0];
    if (!categoryId) return null;
    const found = categories.find(c => c.id === categoryId);
    if (!found) return null;
    return {
      id: found.id,
      name: found.name,
      color: found.color || '#000000',
    };
  }, [categories, video.category_ids]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Link
      href={`/video/${video.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={video.thumbnail_url}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="transform scale-0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
              <Play className="h-6 w-6 text-primary" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Duration badge */}
        {video.metadata?.duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/80 dark:bg-white/80 px-2 py-1 text-xs text-white dark:text-black backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            <span>{video.metadata?.duration}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-2 text-base font-medium text-foreground group-hover:text-primary transition-colors">
          {video.title}
        </h3>

        <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageSquare size={16} />
            <span>{video.notes_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bookmark size={16} />
            <span>{video.highlights_count || 0}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <time className="text-xs text-muted-foreground">
            {formatDate(video.published_at || video.created_at)}
          </time>
          {category && <CategoryTag category={category} />}
        </div>
      </div>
    </Link>
  );
}
