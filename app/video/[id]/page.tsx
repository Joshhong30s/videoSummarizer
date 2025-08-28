'use client';

import { useEffect, useState } from 'react';
import { useVideoDetail } from '@/lib/hooks/video/use-video-detail';
import { VideoPlayer } from './components/video-player';
import { VideoInfo } from './components/video-info';
import { VideoTabs } from './components/video-tabs';
import { VideoSidePanel } from './components/video-side-panel';
import { BackButton } from './components/back-button';
import { VideoPlayerProvider } from '@/lib/contexts/video-player-context';
import { HighlightsProvider } from '@/lib/contexts/highlights-context';
import { VideoNotesProvider } from '@/lib/contexts/video-notes-context';
import { Chatbot } from '@/app/components/chat/chatbot';
import { SpeedDial } from '@/app/components/ui/speed-dial';
import { MessageSquare, Bookmark, Share2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { ErrorBoundary } from '@/app/components/ui/error-boundary';
import { Skeleton } from '@/app/components/ui/skeleton';

interface VideoPageProps {
  params: {
    id: string;
  };
}

// Loading skeleton component
function VideoPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-24 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Error component
function VideoPageError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 p-8 rounded-2xl bg-card/80 backdrop-blur-sm shadow-xl max-w-md"
      >
        <h1 className="text-2xl font-bold text-destructive">
          Error Loading Video
        </h1>
        <p className="text-muted-foreground">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
}

export default function VideoPageEnhanced({ params }: VideoPageProps) {
  const { video, loading, error, refetch } = useVideoDetail(params.id);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | undefined>();
  const [showHighlights, setShowHighlights] = useState(false);

  useEffect(() => {
    async function fetchSessionId() {
      const res = await fetch(`/api/chat/session?videoId=${params.id}`);
      const { sessionId } = await res.json();
      setChatSessionId(sessionId ?? undefined);
    }
    fetchSessionId();
  }, [params.id]);

  if (error) {
    return <VideoPageError error={error} />;
  }

  if (loading || !video) {
    return <VideoPageSkeleton />;
  }

  return (
    <ErrorBoundary>
      <VideoPlayerProvider>
        <HighlightsProvider videoId={video.id}>
          <VideoNotesProvider videoId={video.id}>
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 dark:from-background dark:to-background">
              <div className="container mx-auto px-4 py-6 lg:py-8">
                {/* Back button with animation */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-6"
                >
                  <BackButton />
                </motion.div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Left column - Main content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                  >
                    {/* Enhanced video player with timeline */}
                    <div className="rounded-xl overflow-hidden shadow-2xl bg-card dark:bg-card/50 backdrop-blur-sm">
                      <VideoPlayer
                        videoId={video.youtube_id}
                        videoDbId={video.id}
                      />
                    </div>

                    {/* Video info card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-xl shadow-lg"
                    >
                      <VideoInfo video={video} />
                    </motion.div>

                    {/* Enhanced tabs */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <VideoTabs
                        video={video}
                        onVideoUpdate={refetch}
                      />
                    </motion.div>
                  </motion.div>

                  {/* Right column - Side panel */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <VideoSidePanel
                      video={video}
                      onShowHighlights={() => setShowHighlights(true)}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Speed Dial for actions */}
              <SpeedDial
                actions={[
                  {
                    id: 'chat',
                    icon: <MessageSquare size={20} />,
                    label: 'AI Chat',
                    onClick: () => setShowChatbot(true),
                    color: 'bg-green-600 dark:bg-green-500 text-white',
                  },
                  {
                    id: 'highlights',
                    icon: <Bookmark size={20} />,
                    label: 'Highlights',
                    onClick: () => setShowHighlights(true),
                    color: 'bg-purple-600 dark:bg-purple-500 text-white',
                    badge: video.highlights_count || 0,
                  },
                  {
                    id: 'share',
                    icon: <Share2 size={20} />,
                    label: 'Share',
                    onClick: () => {
                      navigator.share({
                        title: video.title,
                        url: window.location.href,
                      });
                    },
                    color: 'bg-blue-600 dark:bg-blue-500 text-white',
                  },
                  {
                    id: 'download',
                    icon: <Download size={20} />,
                    label: 'Export',
                    onClick: () => {
                      // TODO: Implement export functionality
                    },
                    color: 'bg-gray-600 dark:bg-gray-500 text-white',
                  },
                ]}
              />

              {/* Chatbot */}
              <Chatbot
                isOpen={showChatbot}
                onClose={() => setShowChatbot(false)}
                contextMetadata={{ videoId: params.id }}
                initialSessionId={chatSessionId}
              />
            </div>
          </VideoNotesProvider>
        </HighlightsProvider>
      </VideoPlayerProvider>
    </ErrorBoundary>
  );
}