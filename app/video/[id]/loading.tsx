import {
  Skeleton,
  SkeletonContainer,
  SkeletonGroup,
} from '@/app/components/ui';

export default function VideoLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Video info skeleton */}
      <SkeletonContainer className="p-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            {/* Title and stats */}
            <SkeletonGroup className="space-y-4">
              <Skeleton className="h-7 w-3/4" />

              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>

              <Skeleton className="h-6 w-32" />
            </SkeletonGroup>
          </div>

          {/* Expand button */}
          <Skeleton className="w-8 h-8" />
        </div>
      </SkeletonContainer>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video player skeleton */}
          <Skeleton className="aspect-video w-full" />

          {/* Tabs skeleton */}
          <SkeletonContainer>
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <div className="p-4">
              <SkeletonGroup className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-4 w-16 flex-shrink-0" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </SkeletonGroup>
            </div>
          </SkeletonContainer>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          {/* Related videos skeleton */}
          <SkeletonContainer className="p-4">
            <SkeletonGroup className="space-y-4">
              <Skeleton className="h-6 w-32" />

              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-24 h-16 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </SkeletonGroup>
          </SkeletonContainer>

          {/* Analytics skeleton */}
          <SkeletonContainer className="p-4">
            <SkeletonGroup className="space-y-4">
              <Skeleton className="h-6 w-24" />

              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </SkeletonGroup>
          </SkeletonContainer>
        </div>
      </div>
    </div>
  );
}
