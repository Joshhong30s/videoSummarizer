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
  const { deleteVideo: deleteVideoFromContext, updateVideo } = useVideos();
  const { deleteVideo, updateCategories } = useVideoActions();
  const { categories } = useCategories();
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
      await updateCategories(video.id, selectedCategoryIds);
      updateVideo(video.id, { category_ids: selectedCategoryIds });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update categories:', error);
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
            />
            <div className="flex justify-end gap-2">
              <button
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                onClick={handleUpdateCategories}
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Link href={`/video/${video.id}`}>
        <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary">
          <div className="absolute right-2 top-2 z-10 flex gap-2">
            <button
              onClick={e => {
                e.preventDefault();
                setIsEditing(true);
              }}
              className="rounded-full bg-blue-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
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
              className="rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
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

          <div className="relative aspect-video">
            {getThumbnailUrl() && (
              <Image
                src={getThumbnailUrl()}
                alt={video.title || ''}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={85}
                priority={false}
                className="object-cover"
                onError={handleImageError}
              />
            )}
          </div>

          <div className="flex flex-1 flex-col p-4">
            <h3 className="line-clamp-2 text-lg font-medium group-hover:text-primary">
              {video.title}
            </h3>

            <div className="mt-2 flex items-center justify-between">
              <time className="text-xs text-gray-500">
                {formatDate(video.published_at || video.created_at)}
              </time>
              {selectedCategories.length > 0 && (
                <div
                  className="flex flex-wrap gap-1 justify-end"
                  style={{ maxWidth: '60%' }}
                >
                  {selectedCategories.map(category => (
                    <CategoryTag
                      key={`${category.id}-${category.color}`}
                      category={category}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
