'use client';

import { ReactNode, useState, useCallback, useEffect } from 'react';
import { SearchButton } from '../ui/search-button';
import { SearchSidebar } from '../search/search-sidebar';
import type { VideoListItem } from '@/lib/types';
interface MainLayoutProps {
  children: React.ReactNode;
  initialSidebarOpen?: boolean;
  currentVideo?: VideoListItem | null;
}
export default function MainLayout({
  children,
  initialSidebarOpen = true,
  currentVideo,
}: MainLayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setIsSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>
      {/* 
      <SearchButton
        onClick={() => setIsSearchOpen(true)}
        className="hidden md:block"
      />

      <SearchSidebar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      /> */}
    </>
  );
}
