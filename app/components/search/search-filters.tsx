import { useCategories } from '@/lib/hooks/use-categories';
import { ContentType } from '@/lib/types/search';

interface SearchFiltersProps {
  selectedTypes: ContentType[];
  onTypeChange: (type: ContentType) => void;
}

const contentTypes: ContentType[] = [
  'all',
  'video',
  'takeaway',
  'subtitle',
  'highlight',
  'summary',
];

const contentLabels: Record<ContentType, string> = {
  all: 'All',
  video: 'Video',
  takeaway: 'Note',
  subtitle: 'Subtitle',
  highlight: 'Highlight',
  summary: 'Summary',
};

export function SearchFilters({
  selectedTypes,
  onTypeChange,
}: SearchFiltersProps) {
  const { categories } = useCategories();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {contentTypes.map(type => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-3 py-1 text-sm rounded-full transition-colors
              ${
                selectedTypes.includes(type)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            {contentLabels[type]}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { SearchFiltersProps };
