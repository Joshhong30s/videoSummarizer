import { useState, useCallback, useEffect } from 'react';
import {
  ContentType,
  SearchResult,
  ALL_CONTENT_TYPES,
} from '@/lib/types/search';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [contentTypes, setContentTypes] = useState<ContentType[]>(['all']);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('');
  const [sort, setSort] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const resetFilters = useCallback(() => {
    setContentTypes(['all']);
    setCategoryIds([]);
    setDateRange('');
    setSort('');
  }, []);

  useEffect(() => {
    if (!query) {
      resetFilters();
    }
  }, [query, resetFilters]);

  const performSearch = useCallback(
    async (resetPage = true) => {
      if (!query) {
        setResults([]);
        setTotal(0);
        setHasMore(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const currentPage = resetPage ? 1 : page;

        const searchContentTypes = contentTypes.includes('all')
          ? ALL_CONTENT_TYPES
          : contentTypes;

        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            contentTypes: searchContentTypes,
            categoryIds,
            timeRange: dateRange ? getTimeRange(dateRange) : undefined,
            page: currentPage,
            limit: 20,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Search failed');
        }

        const data = await response.json();

        setResults(prev =>
          resetPage ? data.results : [...prev, ...data.results]
        );
        setTotal(data.total);
        setHasMore(data.hasMore);

        if (resetPage) {
          setPage(1);
        }
      } catch (error) {
        console.error('Search error:', error);
        setError(error instanceof Error ? error : new Error('Search failed'));
      } finally {
        setLoading(false);
      }
    },
    [query, contentTypes, categoryIds, dateRange, page]
  );

  useEffect(() => {
    if (!query) {
      setResults([]);
      setTotal(0);
      setHasMore(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, contentTypes, categoryIds, dateRange, performSearch]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setPage(prev => prev + 1);
    performSearch(false);
  }, [loading, hasMore, performSearch]);

  return {
    query,
    setQuery,
    contentTypes,
    setContentTypes,
    categoryIds,
    setCategoryIds,
    dateRange,
    setDateRange,
    sort,
    setSort,
    results,
    loading,
    error,
    total,
    hasMore,
    loadMore,
  };
}

function getTimeRange(range: string) {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return undefined;
  }

  return {
    start: start.getTime() / 1000,
    end: now.getTime() / 1000,
  };
}
