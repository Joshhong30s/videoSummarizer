'use client';

import { useState } from 'react';
import { useCategories } from '@/lib/contexts/categories-context';
import { useVideoSubmission } from '@/lib/hooks/use-video-submission';
import { Button } from '@/app/components/ui/button';
import { Select } from '@/app/components/ui/select';

interface VideoSubmitFormProps {
  onSuccess?: () => void;
}

export function VideoSubmitForm({ onSuccess }: VideoSubmitFormProps) {
  const [url, setUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { submitVideo, isLoading, error } = useVideoSubmission();
  const { categories, refresh } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      await submitVideo(url, selectedCategories);
      setUrl('');
      setSelectedCategories([]);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to submit video:', err);
    }
  };

  const handleCategoriesChange = async () => {
    await refresh();
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    color: cat.color,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          YouTube URL
        </label>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
          autoFocus
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Categories (optional)
        </label>
        <Select
          value={selectedCategories}
          options={categoryOptions}
          onChange={setSelectedCategories}
          placeholder="Select categories..."
          className="w-full"
          allowManage={true}
          onCategoriesChange={handleCategoriesChange}
        />
      </div>
      
      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={isLoading || !url.trim()}
          className="w-full"
        >
          {isLoading ? 'Processing...' : 'Add Video'}
        </Button>
      </div>
    </form>
  );
}
