'use client';

import { useState } from 'react';
import { VideoDetail } from '@/lib/types';
import { useHighlightsContext } from '@/lib/contexts/highlights-context';
import { useVideoNotes } from '@/lib/contexts/video-notes-context';
import { useCategories } from '@/lib/contexts/categories-context';
import {
  Bookmark,
  MessageSquare,
  Tag,
  TrendingUp,
  Clock,
  FileText,
  Download,
  Share2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/app/components/ui/button';
import { CategoryTag } from '@/app/components/ui/category-tag';

interface VideoSidePanelProps {
  video: VideoDetail;
  onShowHighlights: () => void;
  className?: string;
}

interface StatCard {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  onClick?: () => void;
}

export function VideoSidePanel({
  video,
  onShowHighlights,
  className = '',
}: VideoSidePanelProps) {
  const { highlights } = useHighlightsContext();
  const { notes } = useVideoNotes();
  const { categories } = useCategories();
  const [isExporting, setIsExporting] = useState(false);

  const videoCategories = categories.filter(cat =>
    video.category_ids?.includes(cat.id)
  );

  const statCards: StatCard[] = [
    {
      icon: Bookmark,
      label: 'Highlights',
      value: highlights.length,
      color: 'text-yellow-500',
      onClick: onShowHighlights,
    },
    {
      icon: MessageSquare,
      label: 'Notes',
      value: notes.length,
      color: 'text-purple-500',
    },
    {
      icon: Clock,
      label: 'Watch Time',
      value: video.metadata?.duration || '0:00',
      color: 'text-blue-500',
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    // TODO: Implement export functionality
    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleShare = () => {
    navigator.share({
      title: video.title,
      url: window.location.href,
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-xl p-4"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Quick Stats
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={stat.onClick}
                className={cn(
                  'p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-all',
                  'cursor-pointer hover:shadow-md',
                  'border border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn('w-4 h-4', stat.color)} />
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <p className="text-lg font-semibold">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Categories */}
      {videoCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark rounded-xl p-4"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Categories
          </h3>

          <div className="flex flex-wrap gap-2">
            {videoCategories.map(category => (
              <CategoryTag key={category.id} category={category} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Highlights */}
      {highlights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-yellow-500" />
              Recent Highlights
            </h3>
            <Button variant="ghost" size="sm" onClick={onShowHighlights}>
              View All
            </Button>
          </div>

          <div className="space-y-2">
            {highlights.slice(0, 3).map((highlight, index) => (
              <motion.div
                key={highlight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-2 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
              >
                <p className="text-sm line-clamp-2">{highlight.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(highlight.created_at).toRelativeTime()}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-dark rounded-xl p-4"
      >
        <h3 className="text-lg font-semibold mb-3">Actions</h3>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export Summary'}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            Share Video
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Add relative time helper
declare global {
  interface Date {
    toRelativeTime(): string;
  }
}

Date.prototype.toRelativeTime = function (): string {
  const seconds = Math.floor((new Date().getTime() - this.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return count === 1
        ? `${count} ${interval.label} ago`
        : `${count} ${interval.label}s ago`;
    }
  }

  return 'just now';
};
