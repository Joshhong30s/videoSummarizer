'use client';

import {
  Skeleton,
  SkeletonContainer,
  SkeletonGroup,
} from './components/ui/skeleton';
import {
  VideoCardSkeleton,
  VideoCardGrid,
} from './components/video/video-card';

export default function Loading() {
  return (
    <div className="container py-8 px-4 mx-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <SkeletonContainer className="p-6">
          <SkeletonGroup className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </SkeletonGroup>
        </SkeletonContainer>


        <VideoCardGrid>
          {[...Array(6)].map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </VideoCardGrid>
      </div>
    </div>
  );
}
