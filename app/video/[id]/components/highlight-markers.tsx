'use client';

import { useHighlightsContext } from '@/lib/contexts/highlights-context';
import { useVideoPlayer } from '@/lib/contexts/video-player-context';
import { hexToRGBA } from '@/lib/utils/highlight-colors';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function HighlightMarkers() {
  const { highlights } = useHighlightsContext();
  const { duration } = useVideoPlayer();
  const [markerWidth, setMarkerWidth] = useState(2);

  // Dynamically adjust marker width based on duration
  useEffect(() => {
    if (duration) {
      // For longer videos, use thinner markers
      setMarkerWidth(duration > 3600 ? 1 : 2);
    }
  }, [duration]);

  if (!duration) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 h-1">
      <AnimatePresence>
        {highlights.map(highlight => {
          const left = (highlight.start_offset / duration) * 100;
          const width =
            ((highlight.end_offset - highlight.start_offset) / duration) * 100;

          return (
            <motion.div
              key={highlight.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'absolute',
                left: `${left}%`,
                width: `${Math.max(width, markerWidth)}%`,
                height: '100%',
                backgroundColor: highlight.color
                  ? hexToRGBA(highlight.color, 0.8)
                  : 'rgba(59, 130, 246, 0.8)', // Default blue color
                borderRadius: '2px',
              }}
              title={highlight.content}
              className="cursor-pointer hover:brightness-110 transition-all"
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
