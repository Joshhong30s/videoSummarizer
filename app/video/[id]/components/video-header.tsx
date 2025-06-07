'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Clock, List, SplitSquareHorizontal } from 'lucide-react';
import { formatTime } from '@/lib/utils/format-time';
import { cn } from '@/lib/utils';

interface VideoHeaderProps {
  tab?: string;
  duration?: number;
  highlightsCount: number;
  notesCount: number;
}

export function VideoHeader({
  tab = 'all',
  duration,
  highlightsCount,
  notesCount,
}: VideoHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = useCallback(
    (newTab: string) => {
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        params.append(key, value);
      });
      params.set('tab', newTab);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        {duration && (
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{formatTime(duration)}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTabChange('notes')}
            className={cn(
              'gap-2',
              tab === 'notes' && 'bg-gray-100 text-gray-900'
            )}
          >
            <List className="h-4 w-4" />
            筆記 ({notesCount})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTabChange('highlights')}
            className={cn(
              'gap-2',
              tab === 'highlights' && 'bg-gray-100 text-gray-900'
            )}
          >
            <SplitSquareHorizontal className="h-4 w-4" />
            重點 ({highlightsCount})
          </Button>
        </div>
      </div>
    </div>
  );
}
