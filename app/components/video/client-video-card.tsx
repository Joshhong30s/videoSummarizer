'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { VideoListItem } from '@/lib/types';
import { CategoryTag } from '../ui/category-tag';
import { useVideoActions } from '@/lib/hooks/use-video-actions';
import { useVideos } from '@/lib/contexts/videos-context';
import { useCategories } from '@/lib/contexts/categories-context';
import { Select } from '../ui/select';
import { Modal } from '../ui/modal';

interface ClientVideoCardProps {
  video: VideoListItem;
}

export function ClientVideoCard({ video }: ClientVideoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    video.category_ids || []
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const { deleteVideo: deleteVideoFromContext, updateVideo } = useVideos();
  const { deleteVideo, updateCategories } = useVideoActions();
  const { categories, refresh } = useCategories();
  const [imageError, setImageError] = useState(false);

  const selectedCategories = categories.filter(cat =>
    selectedCategoryIds.includes(cat.id)
  );

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!video.id) return;

    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await deleteVideo(video.id);
      deleteVideoFromContext(video.id);
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  const handleUpdateCategories = async () => {
    if (!video.id) return;
    try {
      setIsUpdating(true);
      await updateCategories(video.id, selectedCategoryIds);
      updateVideo(video.id, { category_ids: selectedCategoryIds });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update categories:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCategoriesChange = async () => {
    try {
      await refresh();
    } catch (error) {
      console.error('Failed to refresh categories:', error);
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    color: cat.color,
  }));

  const handleImageError = () => {
    setImageError(true);
  };

  const getThumbnailUrl = () => {
    if (!video.thumbnail_url) return '';
    if (imageError) {
      const videoId = video.thumbnail_url.match(/\/vi\/([^/]+)\//)?.[1];
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : '';
    }
    return video.thumbnail_url;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      {isEditing && (
        <Modal
          title="Edit Categories"
          isOpen={true}
          onClose={() => setIsEditing(false)}
        >
          <div className="space-y-4 p-4">
            <Select
              value={selectedCategoryIds}
              options={categoryOptions}
              onChange={setSelectedCategoryIds}
              placeholder="Select categories..."
              allowManage={true}
              onCategoriesChange={handleCategoriesChange}
            />
            <div className="flex justify-end gap-2">
              <button
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsEditing(false)}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
                  isUpdating
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                onClick={handleUpdateCategories}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Link href={`/video/${video.id}`}>
        <div className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {/* Action buttons */}
          <div className="absolute right-2 top-2 z-10 flex gap-2">
            <button
              onClick={e => {
                e.preventDefault();
                setIsEditing(true);
              }}
              className="rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 text-gray-700 dark:text-gray-300 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-white dark:hover:bg-gray-800 shadow-sm"
              title="Edit categories"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 text-red-600 dark:text-red-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm"
              title="Delete video"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>

          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
            {getThumbnailUrl() && (
              <Image
                src={getThumbnailUrl()}
                alt={video.title || ''}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={85}
                priority={false}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
              />
            )}
            {/* Play overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                <svg
                  className="w-8 h-8 text-gray-900 dark:text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-4 space-y-3">
            <h3 className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
              {video.title}
            </h3>

            <div className="mt-auto space-y-2">
              {/* Categories */}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedCategories.slice(0, 3).map(category => (
                    <CategoryTag
                      key={`${category.id}-${category.color}`}
                      category={category}
                    />
                  ))}
                  {selectedCategories.length > 3 && (
                    <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                      +{selectedCategories.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Date */}
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <svg
                  className="w-3.5 h-3.5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(video.published_at || video.created_at)}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
