'use client';

import { useCallback } from 'react';
import { useSearch } from '@/lib/hooks/use-search';
import { ContentType } from '@/lib/types/search';
import { SearchResultItem } from './search-result-item';
import { SearchFilters } from './search-filters';
import { cn } from '@/lib/utils';

interface SearchSidebarProps {
  className?: string;
  children?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function SearchSidebar({
  className,
  children,
  isOpen,
  onClose,
}: SearchSidebarProps) {
  const {
    query,
    contentTypes,
    setContentTypes,
    results,
    total,
    loading,
    error,
    loadMore,
  } = useSearch();

  const handleContentTypeChange = useCallback(
    (type: ContentType) => {
      if (contentTypes.includes('all')) {
        setContentTypes([type]);
      } else if (type === 'all') {
        setContentTypes(['all']);
      } else {
        const newTypes = contentTypes.includes(type)
          ? contentTypes.filter(t => t !== type)
          : [...contentTypes, type];
        setContentTypes(newTypes.length ? newTypes : ['all']);
      }
    },
    [contentTypes, setContentTypes]
  );

  // Load more results when scrolling near the bottom
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const div = e.currentTarget;
      const atBottom = div.scrollHeight - div.scrollTop === div.clientHeight;

      if (atBottom && loadMore) {
        loadMore();
      }
    },
    [loadMore]
  );

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'flex flex-col h-full overflow-hidden bg-background',
        className
      )}
    >
      {/* Search Filters */}
      <div className="p-4 border-b">
        <SearchFilters
          selectedTypes={contentTypes}
          onTypeChange={handleContentTypeChange}
        />
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-destructive">
            Search Error: {error.message}
          </div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {query ? 'No results found' : 'Start searching for videos...'}
          </div>
        ) : (
          <div className="divide-y">
            {results.map(result => (
              <SearchResultItem
                key={`${result.content_type}-${result.video_id}`}
                result={result}
              />
            ))}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {query && !loading && !error && (
        <div className="p-4 border-t text-sm text-muted-foreground">
          {total} Results
        </div>
      )}

      {/* Optional Children */}
      {children}
    </div>
  );
}
