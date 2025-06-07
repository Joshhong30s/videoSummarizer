'use client';

import { SortAsc, SortDesc } from 'lucide-react';

import type { SortableFields } from '@/lib/types/video';

interface SortButtonProps {
  field: SortableFields;
  children: React.ReactNode;
  sortField?: SortableFields;
  sortOrder?: 'asc' | 'desc';
  onSort: (field: SortableFields) => void;
}

export function SortButton({
  field,
  children,
  sortField,
  sortOrder,
  onSort,
}: SortButtonProps) {
  const isActive = sortField === field;

  return (
    <button
      onClick={() => onSort(field)}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
        transition-colors duration-200
        ${
          isActive
            ? 'bg-gray-100 text-gray-900 font-medium'
            : 'text-gray-600 hover:bg-gray-50'
        }
      `}
    >
      {children}
      {isActive && (
        <span className="w-4 h-4">
          {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
        </span>
      )}
    </button>
  );
}
