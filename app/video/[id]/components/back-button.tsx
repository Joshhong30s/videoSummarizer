'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useVideos } from '@/lib/contexts/videos-context';

export function BackButton() {
  const { refetch } = useVideos();
  return (
    <Link
      href="/"
      className="
        fixed top-0 left-0 right-0 z-50
        flex items-center gap-2 
        px-4 py-3
        bg-white/80 backdrop-blur-sm
        border-b
        transition-colors hover:bg-white/90
        sm:static sm:bg-transparent sm:border-none sm:py-2 sm:px-0
        sm:w-fit sm:hover:bg-gray-50 sm:rounded-lg
      "
      onClick={() => {
        refetch();
      }}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Back to Main Page</span>
    </Link>
  );
}
