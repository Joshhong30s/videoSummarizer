export function SearchResultSkeleton() {
  return (
    <div className="flex gap-4 rounded-lg border p-4">
      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-gray-200 animate-pulse" />

      <div className="flex-1 space-y-2">
        <div className="space-y-1">
          <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-20 rounded-full bg-gray-200 animate-pulse" />
        </div>

        <div className="space-y-1">
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

export function SearchResultSkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <SearchResultSkeleton key={i} />
      ))}
    </div>
  );
}
