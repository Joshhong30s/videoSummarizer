'use client';

import { Skeleton } from '../ui/skeleton';

export function VideoCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300">
      {/* Thumbnail skeleton */}
      <div className="aspect-video w-full overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        
        {/* Metadata skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        {/* Categories skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function VideoCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}