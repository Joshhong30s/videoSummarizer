'use client';

import { useCategories } from '@/lib/contexts/categories-context';
import { CategoryTag } from '../ui/category-tag';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { ContentType } from '@/lib/types/search';

export interface VideoFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  selectedCategories: string[];
  onCategoryChange: (ids: string[]) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  contentTypes?: ContentType[];
  contentTypeOptions?: Array<{ label: string; value: ContentType }>;
  onContentTypesChange?: (types: ContentType[]) => void;
}

export function VideoFilters({
  query,
  onQueryChange,
  selectedCategories,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  sort,
  onSortChange,
  contentTypes = [],
  contentTypeOptions = [],
  onContentTypesChange,
}: VideoFiltersProps) {
  const { categories } = useCategories();

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const handleContentTypeChange = (value: ContentType) => {
    if (!onContentTypesChange) return;

    if (contentTypes.includes(value)) {
      onContentTypesChange(contentTypes.filter(type => type !== value));
    } else {
      onContentTypesChange([...contentTypes, value]);
    }
  };

  const clearSearch = () => {
    onQueryChange('');
  };

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && query) {
        clearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search videos..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pr-8"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {contentTypeOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {contentTypeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleContentTypeChange(option.value)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                contentTypes.includes(option.value)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={`${category.id}-${category.color}`}
            onClick={() => handleCategoryClick(category.id)}
            className="group"
          >
            <CategoryTag
              category={category}
              selected={selectedCategories.includes(category.id)}
            />
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <select
          value={dateRange}
          onChange={e => onDateRangeChange(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Time</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>

        <select
          value={sort}
          onChange={e => onSortChange(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  );
}
