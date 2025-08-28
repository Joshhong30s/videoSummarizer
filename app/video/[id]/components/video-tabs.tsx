'use client';

import { useState, useEffect, useRef } from 'react';
import { VideoDetail } from '@/lib/types';
import { SubtitlesView } from './subtitles-view';
import { SummaryView } from './summary-view';
import { NotesManager } from '@/app/components/video/notes/notes-manager';
import { useVideoProcessing } from '@/lib/hooks/video/use-video-processing';
import { FileText, BookOpen, PenTool, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface VideoTabsProps {
  video: VideoDetail;
  onVideoUpdate?: () => void;
  className?: string;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const tabs: Tab[] = [
  {
    id: 'subtitles',
    label: 'Subtitles',
    icon: FileText,
    color: 'text-blue-500',
  },
  { id: 'summary', label: 'Summary', icon: BookOpen, color: 'text-green-500' },
  { id: 'notes', label: 'Notes', icon: PenTool, color: 'text-purple-500' },
];

export function VideoTabs({
  video,
  onVideoUpdate,
  className = '',
}: VideoTabsProps) {
  const [activeTab, setActiveTab] = useState('subtitles');
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const { processVideo, loading } = useVideoProcessing();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (
      !hasProcessedRef.current &&
      video.status === 'pending' &&
      (!video.summary || !video.summary.subtitles)
    ) {
      hasProcessedRef.current = true;

      processVideo(video.id, video.youtube_id)
        .then(() => {
          console.log('Video processing completed');
          onVideoUpdate?.();
        })
        .catch(error => {
          console.error('Failed to process video:', error);
          hasProcessedRef.current = false;
        });
    }
  }, [
    video.id,
    video.status,
    video.youtube_id,
    video.summary?.subtitles,
    onVideoUpdate,
    processVideo,
  ]);

  // Update indicator position
  useEffect(() => {
    const activeTabRef = tabRefs.current[activeTab];
    if (activeTabRef) {
      const { offsetLeft, offsetWidth } = activeTabRef;
      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeTab]);

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 h-full flex flex-col',
        className
      )}
    >
      {/* Tab headers */}
      <div className="relative flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={el => {
                tabRefs.current[tab.id] = el;
              }}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-3',
                'text-sm font-medium transition-all duration-200',
                'hover:bg-white dark:hover:bg-gray-800',
                isActive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive && tab.color)} />
              <span>{tab.label}</span>
              {tab.id === 'summary' && video?.summary && (
                <Sparkles className="w-3 h-3 text-yellow-500" />
              )}
            </button>
          );
        })}

        {/* Animated indicator */}
        <motion.div
          className="absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"
          initial={false}
          animate={indicatorStyle}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'subtitles' && (
            <motion.div
              key="subtitles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <SubtitlesView video={video} />
            </motion.div>
          )}

          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <SummaryView video={video} onSummaryChange={onVideoUpdate} />
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <NotesManager videoId={video.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Processing video...</p>
          </div>
        </div>
      )}
    </div>
  );
}
