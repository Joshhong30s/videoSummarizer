'use client';

import { useState, useEffect } from 'react';
import { useCategories } from '@/lib/contexts/categories-context';
import { useSearch } from '@/lib/hooks/use-search';
import { VideoCardGrid } from '@/app/components/video/video-card-grid';
import { SearchBar } from '@/app/components/search/search-bar';
import { VideoListFilters } from '@/app/components/video/video-list-filters';
import { SearchResultItem } from '@/app/components/search/search-result-item';
import { SearchResultSkeletonList } from '@/app/components/search/search-result-skeleton';
import { VideoSubmitForm } from '@/app/components/video/video-submit-form';
import { CONTENT_TYPE_OPTIONS } from '@/lib/types/search';
import { Loader2, MessageSquare } from 'lucide-react';
import { useVideos } from '@/lib/contexts/videos-context';
import { ClientVideoCard } from '@/app/components/video/client-video-card';
import { Chatbot } from '@/app/components/chat/chatbot';
import { FAB } from '@/app/components/ui/fab';
import { Modal } from '@/app/components/ui/modal';
import { CategoryTag } from '@/app/components/ui/category-tag';
import { AppHeader } from '@/app/components/layout/app-header';

export function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const { categories } = useCategories();
  const { videos, isLoading: videosLoading } = useVideos();
  const {
    query,
    setQuery,
    categoryIds,
    setCategoryIds,
    contentTypes,
    setContentTypes,
    dateRange,
    setDateRange,
    sort,
    setSort,
    results,
    loading: searchLoading,
    total,
    hasMore,
    loadMore,
  } = useSearch();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const showSearchResults = query.length > 0;

  const isWithinRange = (
    dateStr: string | undefined,
    range: string
  ): boolean => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayInMs = 24 * 60 * 60 * 1000;

    switch (range) {
      case 'week':
        return diff <= 7 * dayInMs;
      case 'month':
        return diff <= 30 * dayInMs;
      case 'year':
        return diff <= 365 * dayInMs;
      default:
        return true;
    }
  };

  let filteredVideos = [...videos];

  if (categoryIds.length > 0) {
    filteredVideos = filteredVideos.filter(video =>
      video.category_ids?.some(id => categoryIds.includes(id))
    );
  }

  if (dateRange) {
    filteredVideos = filteredVideos.filter(video =>
      isWithinRange(video.published_at || video.created_at, dateRange)
    );
  }

  filteredVideos.sort((a, b) => {
    const dateA = new Date(a.published_at || a.created_at);
    const dateB = new Date(b.published_at || b.created_at);
    return sort === 'oldest'
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 pt-4 pb-8 space-y-8">
        <Modal
          isOpen={showAddVideoModal}
          onClose={() => setShowAddVideoModal(false)}
          title="Add New Video"
        >
          <div className="p-4">
            <VideoSubmitForm onSuccess={() => setShowAddVideoModal(false)} />
          </div>
        </Modal>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Search</h2>
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            contentTypes={contentTypes}
            contentTypeOptions={CONTENT_TYPE_OPTIONS}
            onContentTypesChange={setContentTypes}
          />
        </div>

        {showSearchResults ? (
          <div className="rounded-lg border bg-card p-6">
            {/* Search Results Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {searchLoading && !results.length
                  ? 'Searching...'
                  : `Found ${total} results`}
              </h2>
            </div>

            {searchLoading && !results.length ? (
              <SearchResultSkeletonList />
            ) : (
              <>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <SearchResultItem
                      key={`${result.video_id}-${index}`}
                      result={result}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={loadMore}
                      disabled={searchLoading}
                      className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {searchLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h2 className="text-lg font-semibold whitespace-nowrap hidden sm:block">
                    Video List
                  </h2>
                  <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                    <select
                      value={dateRange}
                      onChange={e => setDateRange(e.target.value)}
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    >
                      <option value="">All Time</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                    <select
                      value={sort}
                      onChange={e => setSort(e.target.value)}
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    >
                      <option value="">Newest</option>
                      <option value="oldest">Oldest</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100">
                  {categories.map(category => (
                    <button
                      key={`${category.id}-${category.color}`}
                      onClick={() => {
                        if (categoryIds.includes(category.id)) {
                          setCategoryIds(
                            categoryIds.filter(id => id !== category.id)
                          );
                        } else {
                          setCategoryIds([...categoryIds, category.id]);
                        }
                      }}
                      className="group"
                    >
                      <CategoryTag
                        category={category}
                        selected={categoryIds.includes(category.id)}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {videosLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <VideoCardGrid>
                {filteredVideos.map(video => (
                  <ClientVideoCard key={video.id} video={video} />
                ))}
              </VideoCardGrid>
            )}
          </div>
        )}

        <FAB
          onClick={() => setShowChatbot(true)}
          icon={<MessageSquare size={24} />}
          aria-label="Open chat"
          className="bottom-6 right-6"
        />
        <FAB
          onClick={() => setShowAddVideoModal(true)}
          aria-label="Add new video"
          className="bottom-24 right-6"
        />
      </div>
      <Chatbot isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </>
  );
}
