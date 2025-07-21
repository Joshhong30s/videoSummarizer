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
        relative flex gap-3 px-3 py-1.5 group border-l-2
        ${highlighted 
          ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-400' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-900/30 border-transparent hover:border-gray-300'
        }
        transition-all duration-200
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-16 flex-none text-xs text-gray-400 font-mono pt-0.5">
        {formatDuration(subtitle.start)}
      </div>

      <div className="flex-1 min-w-0">
        {translation ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-0.5">
            <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
              {subtitle.text}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed lg:border-l lg:pl-6 lg:border-gray-200 dark:lg:border-gray-700">
              {translation}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
            {subtitle.text}
          </p>
        )}
      </div>

      {(isHovered || highlighted) && (onHighlight || onUnhighlight) && (
        <button
          onClick={highlighted ? onUnhighlight : onHighlight}
          className={`
            absolute right-2 top-1.5
            p-1 rounded transition-all duration-200
            ${
              highlighted
                ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
          title={highlighted ? 'Remove highlight' : 'Add highlight'}
        >
          <Star
            className="w-3.5 h-3.5"
            fill={highlighted ? 'currentColor' : 'none'}
          />
        </button>
      )}
    </div>
  );
}
