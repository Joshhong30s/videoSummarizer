'use client';

import { cn } from '@/lib/utils/cn';

export interface CategoryTagProps {
  category: {
    id: string;
    name: string;
    color: string;
  };
  selected?: boolean;
  onClick?: () => void;
}

export function CategoryTag({
  category,
  selected = false,
  onClick,
}: CategoryTagProps) {
  const baseClasses =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors';
  const defaultColor = 'bg-gray-100 hover:bg-gray-200 text-gray-800';

  const interactiveClasses = onClick ? 'cursor-pointer' : '';
  const selectedClasses = selected ? 'ring-2 ring-offset-2' : '';

  return (
    <span
      onClick={onClick}
      className={cn(baseClasses, interactiveClasses, selectedClasses)}
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
        borderColor: `${category.color}40`,
      }}
    >
      {category.name}
    </span>
  );
}
