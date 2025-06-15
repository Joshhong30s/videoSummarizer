import { useState, useCallback, useMemo } from 'react';
import { formatTimestamp, parseTime } from '@/lib/utils/format-time';
import type { SubtitleEntry } from '@/lib/types';

export interface SubtitleRange {
  startMinute: number;
  endMinute: number;
  subtitles: SubtitleEntry[];
}

export function useSubtitleRange(allSubtitles: SubtitleEntry[]) {
  const maxMinute = useMemo(() => {
    if (allSubtitles.length === 0) return 0;
    const lastSubtitle = allSubtitles[allSubtitles.length - 1];
    return Math.ceil((lastSubtitle.start + lastSubtitle.duration) / 60);
  }, [allSubtitles]);

  const [range, setRange] = useState<[number, number]>([0, maxMinute]);

  const filteredSubtitles = useMemo(() => {
    return allSubtitles.filter(
      s => s.start >= range[0] * 60 && s.start <= range[1] * 60
    );
  }, [allSubtitles, range]);

  const getPlainText = useCallback(() => {
    return filteredSubtitles.map(s => s.text).join('\n\n');
  }, [filteredSubtitles]);

  const getTimedText = useCallback(() => {
    return filteredSubtitles
      .map(s => `${formatTimestamp(s.start)}\n${s.text}\n`)
      .join('\n');
  }, [filteredSubtitles]);

  const parseTimedTranslation = useCallback((text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const translations: { time: string; text: string }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(line)) {
        const nextLine = lines[i + 1];
        if (nextLine) {
          translations.push({
            time: line,
            text: nextLine.trim(),
          });
          i++;
        }
      }
    }
    return translations;
  }, []);

  const copyToClipboard = useCallback(
    async (format: 'plain' | 'timed') => {
      const text = format === 'plain' ? getPlainText() : getTimedText();
      await navigator.clipboard.writeText(text);
    },
    [getPlainText, getTimedText]
  );

  return {
    range,
    setRange,
    maxMinute,
    filteredSubtitles,
    getPlainText,
    getTimedText,
    parseTimedTranslation,
    parseTime,
    copyToClipboard,
  };
}
