'use client';

import { useState } from 'react';
import { Calendar, Clock, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VideoDetail } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/app/components/ui/button';

interface VideoInfoProps {
  video: VideoDetail;
  className?: string;
}

export function VideoInfo({
  video,
  className = '',
}: VideoInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDetailDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(video.youtube_id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className={cn(
        'glass-dark rounded-xl p-4 transition-all duration-300',
        className
      )}
    >
      <div className="space-y-3">
        {/* Title and basic info */}
        <div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            {video.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(video.published_at || video.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {video.metadata?.duration || 'N/A'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`https://youtube.com/watch?v=${video.youtube_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Watch on YouTube
          </a>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Details
              </>
            )}
          </button>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border pt-3"
            >
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Video ID</dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm">
                    <span className="truncate font-mono">{video.youtube_id}</span>
                    <button
                      onClick={handleCopyId}
                      className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      title="Copy Video ID"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm">
                    <span>{video.summary ? 'Complete' : 'Processing'}</span>
                    {video.summary && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-xs font-medium text-green-800">
                        ✓
                      </span>
                    )}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Added On</dt>
                  <dd className="mt-1 text-sm">
                    {formatDetailDate(video.created_at)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="mt-1 text-sm">
                    {formatDetailDate(video.updated_at)}
                  </dd>
                </div>
              </dl>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
