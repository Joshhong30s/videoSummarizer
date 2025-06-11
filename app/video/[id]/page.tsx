'use client';

import { useState } from 'react';
import { useVideoDetail } from '@/lib/hooks/video/use-video-detail';
import { VideoPlayer } from './components/video-player';
import { VideoInfo } from './components/video-info';
import { VideoTabs } from './components/video-tabs';
import { BackButton } from './components/back-button';
import { ScrollTopButton } from './components/scroll-top-button';
import { VideoPlayerProvider } from '@/lib/contexts/video-player-context';
import { HighlightsProvider } from '@/lib/contexts/highlights-context';
import { VideoNotesProvider } from '@/lib/contexts/video-notes-context';
import { Chatbot } from '@/app/components/chat/chatbot';
import { FAB } from '@/app/components/ui/fab';
import { MessageSquare } from 'lucide-react';

interface VideoPageProps {
  params: {
    id: string;
  };
}

export default function VideoPage({ params }: VideoPageProps) {
  const { video, loading, error, refetch } = useVideoDetail(params.id);
  const [showChatbot, setShowChatbot] = useState(false);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Error loading video
          </h1>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (loading || !video) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <VideoPlayerProvider>
        <HighlightsProvider videoId={video.id}>
          <VideoNotesProvider videoId={video.id}>
            <div className="min-h-screen pt-12 sm:pt-0">
              {' '}
              <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-8">
                <div className="space-y-6">
                  <BackButton />
                  <VideoPlayer videoId={video.youtube_id} />
                  <VideoInfo
                    video={{ ...video, summary: video.summary ?? undefined }}
                  />
                  <VideoTabs
                    video={{ ...video, summary: video.summary ?? undefined }}
                    onVideoUpdate={refetch}
                  />
                </div>
              </div>
            </div>
            <ScrollTopButton />
          </VideoNotesProvider>
        </HighlightsProvider>
      </VideoPlayerProvider>

      <FAB
        onClick={() => setShowChatbot(true)}
        icon={<MessageSquare size={24} />}
        aria-label="Open chat"
        className="bottom-6 right-6"
      />

      <Chatbot
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        contextMetadata={{ videoId: params.id }}
      />
    </>
  );
}
