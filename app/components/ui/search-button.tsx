'use client';

import { Search } from 'lucide-react';

interface SearchButtonProps {
  onClick: () => void;
  className?: string;
}

export function SearchButton({ onClick, className }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed right-6 top-6 z-50 rounded-full bg-white p-3 shadow-lg hover:bg-gray-50 ${className}`}
      title="Search (Ctrl+Shift+F)"
    >
      <Search className="h-5 w-5" />
    </button>
  );
}
