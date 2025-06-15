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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Post a YouTube URL"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isLoading}
          />
          {error && (
            <p className="mt-1 text-sm text-destructive">{error.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isLoading || !url.trim()}>
          {isLoading ? 'Processing' : 'Add New Video'}
        </Button>
      </div>
      <div className="space-y-2">
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
    </form>
  );
}
