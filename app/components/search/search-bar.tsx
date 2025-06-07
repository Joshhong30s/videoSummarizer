'use client';

import { X } from 'lucide-react';
import { ContentType } from '@/lib/types/search';

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  contentTypes?: ContentType[];
  contentTypeOptions?: Array<{ label: string; value: ContentType }>;
  onContentTypesChange?: (types: ContentType[]) => void;
}

export function SearchBar({
  query,
  onQueryChange,
  contentTypes = [],
  contentTypeOptions = [],
  onContentTypesChange,
}: SearchBarProps) {
  const handleContentTypeChange = (value: ContentType) => {
    if (!onContentTypesChange) return;
    if (contentTypes.includes(value)) {
      onContentTypesChange(contentTypes.filter(type => type !== value));
    } else {
      onContentTypesChange([...contentTypes, value]);
    }
  };

  return (
    <div className="space-y-4">
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
            onClick={() => onQueryChange('')}
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
    </div>
  );
}
