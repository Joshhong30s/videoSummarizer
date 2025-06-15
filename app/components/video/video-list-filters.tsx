'use client';

import { CategoryTag } from '../ui/category-tag';
import { useCategories } from '@/lib/contexts/categories-context';

interface VideoListFiltersProps {
  selectedCategories: string[];
  onCategoryChange: (ids: string[]) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
}

export function VideoListFilters({
  selectedCategories,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  sort,
  onSortChange,
}: VideoListFiltersProps) {
  const { categories } = useCategories();

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        <select
          value={dateRange}
          onChange={e => onDateRangeChange(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Time</option>
          <option value="week">Within a Week</option>
          <option value="month">Within a Month</option>
          <option value="year">Within a Year</option>
        </select>

        <select
          value={sort}
          onChange={e => onSortChange(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
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
    </>
  );
}
