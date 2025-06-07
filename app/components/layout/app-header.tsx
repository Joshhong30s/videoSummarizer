'use client';

import { useCategories } from '@/lib/contexts/categories-context';
import { useVideos } from '@/lib/contexts/videos-context';
import { Logo } from '@/app/components/ui/logo';

export function AppHeader() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap"
        rel="stylesheet"
      />
      <header className="bg-white/70 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-10 mb-3 flex items-center justify-center gap-2">
          <Logo />
          <span
            className="font-semibold"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            VideoSummarizer
          </span>
        </div>
      </header>
    </>
  );
}
