'use client';

const SKELETON_BG = 'bg-gray-300';

export function SkeletonCard() {
  return (
    <div className={`${SKELETON_BG} p-4 rounded-lg border border-gray-400`}>
      <div className="aspect-video rounded-md mb-4" />
      <div className="space-y-3">
        <div className="h-4 rounded w-3/4" />
        <div className="h-4 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 rounded w-16" />
          <div className="h-6 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCardGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function SkeletonSearch() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`h-10 rounded-lg mb-4 border border-gray-400 ${SKELETON_BG}`}
      />
      <div className="flex gap-2 mb-6">
        <div
          className={`h-8 rounded-lg w-24 border border-gray-400 ${SKELETON_BG}`}
        />
        <div
          className={`h-8 rounded-lg w-24 border border-gray-400 ${SKELETON_BG}`}
        />
        <div
          className={`h-8 rounded-lg w-24 border border-gray-400 ${SKELETON_BG}`}
        />
      </div>
    </div>
  );
}
