'use client';

import { useState, useEffect } from 'react';
import { HighlightsDrawer } from './highlights-drawer';
import { FAB } from '@/app/components/ui/fab';
import { Highlighter } from 'lucide-react';
import { useVideoPlayer } from '@/lib/contexts/video-player-context';

interface HighlightsManagerProps {
  videoId: string;
}

export function HighlightsManager({ videoId }: HighlightsManagerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // const { registerShortcut } = useVideoPlayer();

  // Register keyboard shortcut for toggling highlights drawer
  // useEffect(() => {
  //   return registerShortcut('h', () => {
  //     setIsDrawerOpen(prev => !prev);
  //   });
  // }, [registerShortcut]);

  return (
    <>
      <FAB
        icon={<Highlighter className="h-6 w-6" />}
        onClick={() => setIsDrawerOpen(true)}
        label="Show highlights"
        title="Show highlights (H)"
        className="left-24"
      />

      <HighlightsDrawer
        videoId={videoId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
