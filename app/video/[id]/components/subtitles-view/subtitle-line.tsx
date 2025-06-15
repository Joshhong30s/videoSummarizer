'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { formatDuration } from '@/lib/utils/format-time';
import type { SubtitleEntry } from '@/lib/types';

interface SubtitleLineProps {
  subtitle: SubtitleEntry;
  translation?: string | null;
  highlighted?: boolean;
  onHighlight?: () => void;
  onUnhighlight?: () => void;
}

export function SubtitleLine({
  subtitle,
  translation,
  highlighted = false,
  onHighlight,
  onUnhighlight,
}: SubtitleLineProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        relative flex gap-4 p-2 group rounded-md 
        ${highlighted ? 'bg-blue-200/40' : 'hover:bg-gray-50/70'}
        transition-all duration-300 ease-in-out
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-20 flex-none text-sm text-gray-500 font-mono">
        {formatDuration(subtitle.start)}
      </div>

      <div className="flex-1 space-y-1">
        <p className="text-sm text-gray-900">{subtitle.text}</p>
        {translation && (
          <p className="text-sm text-gray-500 italic">{translation}</p>
        )}
      </div>

      {(isHovered || highlighted) && (onHighlight || onUnhighlight) && (
        <button
          onClick={highlighted ? onUnhighlight : onHighlight}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            p-1.5 rounded-full transition-colors
            ${
              highlighted
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-400 hover:text-gray-600'
            }
          `}
          title={highlighted ? 'Remove highlight' : 'Add highlight'}
        >
          <Star
            className="w-4 h-4"
            fill={highlighted ? 'currentColor' : 'none'}
          />
        </button>
      )}
    </div>
  );
}
