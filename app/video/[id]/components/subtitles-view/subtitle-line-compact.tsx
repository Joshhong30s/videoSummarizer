'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { formatDuration } from '@/lib/utils/format-time';
import type { SubtitleEntry } from '@/lib/types';

interface SubtitleLineCompactProps {
  subtitle: SubtitleEntry;
  translation?: string | null;
  highlighted?: boolean;
  onHighlight?: () => void;
  onUnhighlight?: () => void;
}

export function SubtitleLineCompact({
  subtitle,
  translation,
  highlighted = false,
  onHighlight,
  onUnhighlight,
}: SubtitleLineCompactProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        relative flex gap-2 px-2 py-0.5 group text-xs
        ${highlighted 
          ? 'bg-yellow-50 dark:bg-yellow-900/10' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-900/30'
        }
        transition-colors duration-150
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-12 flex-none text-gray-400 font-mono">
        {formatDuration(subtitle.start)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex gap-2">
          <span className="text-gray-700 dark:text-gray-300">
            {subtitle.text}
          </span>
          {translation && (
            <>
              <span className="text-gray-400 dark:text-gray-600">|</span>
              <span className="text-gray-500 dark:text-gray-400">
                {translation}
              </span>
            </>
          )}
        </div>
      </div>

      {isHovered && (onHighlight || onUnhighlight) && (
        <button
          onClick={highlighted ? onUnhighlight : onHighlight}
          className={`
            absolute right-1 top-0.5
            p-0.5 rounded transition-colors
            ${
              highlighted
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-400 hover:text-gray-600'
            }
          `}
          title={highlighted ? 'Remove highlight' : 'Add highlight'}
        >
          <Star
            className="w-3 h-3"
            fill={highlighted ? 'currentColor' : 'none'}
          />
        </button>
      )}
    </div>
  );
}