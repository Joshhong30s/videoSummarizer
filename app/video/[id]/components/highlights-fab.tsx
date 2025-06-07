'use client';

import { useHighlightsContext } from '@/lib/contexts/highlights-context';
import { FAB } from '@/app/components/ui/fab';
import { List } from 'lucide-react';

interface HighlightsFabProps {
  className?: string;
  onClick?: () => void;
}

export function HighlightsFab({ className = '', onClick }: HighlightsFabProps) {
  const { highlights } = useHighlightsContext();
  const highlightsCount = highlights?.length ?? 0;

  return (
    <FAB
      onClick={onClick}
      className={className}
      badge={highlightsCount > 0 ? highlightsCount : undefined}
      icon={<List className="h-5 w-5" />}
      label="Highlights"
    />
  );
}
