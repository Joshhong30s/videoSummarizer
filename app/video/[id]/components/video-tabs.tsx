'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { useEffect } from 'react';
import { VideoDetail } from '@/lib/types';
import { SubtitlesView } from './subtitles-view';
import { SummaryView } from './summary-view';
import { NotesManager } from '@/app/components/video/notes/notes-manager';
import { useVideoProcessing } from '@/lib/hooks/video/use-video-processing';

interface VideoTabsProps {
  video: VideoDetail;
  onVideoUpdate?: () => void;
  className?: string;
}

export function VideoTabs({
  video,
  onVideoUpdate,
  className = '',
}: VideoTabsProps) {
  const { processVideo, loading } = useVideoProcessing();

  useEffect(() => {
    // Trigger processing when video status is pending and has no subtitles
    if (
      video.status === 'pending' &&
      (!video.summary || !video.summary.subtitles)
    ) {
      processVideo(video.id, video.youtube_id)
        .then(() => {
          console.log('Video processing completed');
          onVideoUpdate?.();
        })
        .catch(error => {
          console.error('Failed to process video:', error);
        });
    }
  }, [
    video.id,
    video.status,
    video.youtube_id,
    video.summary,
    processVideo,
    onVideoUpdate,
  ]);

  return (
    <Tabs.Root
      defaultValue="subtitles"
      className={`rounded-lg border border-gray-200 bg-white ${className}`}
    >
      <Tabs.List className="flex border-b border-gray-200">
        <Tabs.Trigger
          value="subtitles"
          className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 [&[data-state=active]]:border-b-2 [&[data-state=active]]:border-blue-600 [&[data-state=active]]:text-blue-600"
        >
          Subtitles
        </Tabs.Trigger>
        <Tabs.Trigger
          value="summary"
          className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 [&[data-state=active]]:border-b-2 [&[data-state=active]]:border-blue-600 [&[data-state=active]]:text-blue-600"
        >
          Summary
        </Tabs.Trigger>
        <Tabs.Trigger
          value="notes"
          className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 [&[data-state=active]]:border-b-2 [&[data-state=active]]:border-blue-600 [&[data-state=active]]:text-blue-600"
        >
          Notes
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="subtitles" className="p-4 focus:outline-none">
        <SubtitlesView video={video} />
      </Tabs.Content>

      <Tabs.Content value="summary" className="p-4 focus:outline-none">
        <SummaryView video={video} onSummaryChange={onVideoUpdate} />
      </Tabs.Content>

      <Tabs.Content value="notes" className="p-4 focus:outline-none">
        <NotesManager videoId={video.id} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
