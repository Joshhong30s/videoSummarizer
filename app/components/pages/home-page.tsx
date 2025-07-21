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
import { Button } from '@/app/components/ui/button';
import { ClientVideoCard } from '@/app/components/video/client-video-card';
import { ChatbotRefactored as Chatbot } from '@/app/components/chat/chatbot-refactored';
import { SpeedDial } from '@/app/components/ui/speed-dial';
import { Modal } from '@/app/components/ui/modal';
import { CategoryTag } from '@/app/components/ui/category-tag';
import { AppHeaderEnhanced as AppHeader } from '@/app/components/layout/app-header-enhanced';
import { EmptyState } from '@/app/components/ui/empty-state';
import { ErrorBoundary } from '@/app/components/ui/error-boundary';
import { Plus, Video } from 'lucide-react';

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
    <ErrorBoundary>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <Modal
          isOpen={showAddVideoModal}
          onClose={() => setShowAddVideoModal(false)}
          title="Add New Video"
        >
          <div className="p-4">
            <VideoSubmitForm onSuccess={() => setShowAddVideoModal(false)} />
          </div>
        </Modal>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-8 shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Search Your Videos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Find summaries, transcripts, and insights across all your videos
            </p>
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              contentTypes={contentTypes}
              contentTypeOptions={CONTENT_TYPE_OPTIONS}
              onContentTypesChange={setContentTypes}
            />
          </div>
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
          <div className="space-y-6">
            {/* Filters Section */}
            <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Your Video Library
                </h2>
                <div className="flex gap-2 items-center">
                  <select
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>
              </div>

              {/* Category Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 py-1">
                  Filter by:
                </span>
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
                    className="transition-all duration-200"
                  >
                    <CategoryTag
                      category={category}
                      selected={categoryIds.includes(category.id)}
                    />
                  </button>
                ))}
              </div>
            </div>
            {videosLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredVideos.length === 0 ? (
              <EmptyState
                icon={<Video className="h-12 w-12" />}
                title="No videos found"
                description="Try adjusting your filters or add a new video to get started"
                action={
                  <Button
                    onClick={() => setShowAddVideoModal(true)}
                    variant="gradient"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Video
                  </Button>
                }
              />
            ) : (
              <VideoCardGrid>
                {filteredVideos.map(video => (
                  <ClientVideoCard key={video.id} video={video} />
                ))}
              </VideoCardGrid>
            )}
          </div>
        )}

        <SpeedDial
          actions={[
            {
              id: 'chat',
              icon: <MessageSquare size={20} />,
              label: 'Open Chat',
              onClick: () => setShowChatbot(true),
              color: 'bg-green-600 dark:bg-green-500 text-white',
            },
            {
              id: 'add-video',
              icon: <Plus size={20} />,
              label: 'Add Video',
              onClick: () => setShowAddVideoModal(true),
              color: 'bg-purple-600 dark:bg-purple-500 text-white',
            },
          ]}
        />
      </div>
      <Chatbot isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </ErrorBoundary>
  );
}
