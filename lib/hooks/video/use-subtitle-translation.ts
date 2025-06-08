import { useState, useCallback, useEffect } from 'react';
import { SubtitleEntry } from '@/lib/types';
import { formatDuration, timeToSeconds } from '@/lib/utils';

interface Translation {
  start: number;
  translation: string | null;
}

interface UseSubtitleTranslationProps {
  videoId: string;
  subtitles: SubtitleEntry[];
}

export function useSubtitleTranslation({
  videoId,
  subtitles,
}: UseSubtitleTranslationProps) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    async function loadExistingTranslations() {
      try {
        const response = await fetch(`/api/videos/${videoId}/translations`);
        if (response.ok) {
          const { translations: loadedTranslations } = await response.json();
          setTranslations(loadedTranslations);
        }
      } catch (err) {
        console.error('Error loading translations:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load translations'
        );
      }
    }

    loadExistingTranslations();
  }, [videoId]);

  const translateSubtitles = useCallback(async () => {
    try {
      setIsTranslating(true);
      setError(null);

      const translateResponse = await fetch(`/api/videos/${videoId}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtitles }),
      });

      if (!translateResponse.ok) {
        throw new Error('Failed to translate subtitles');
      }

      const loadResponse = await fetch(`/api/videos/${videoId}/translations`);
      if (!loadResponse.ok) {
        throw new Error('Failed to load translations');
      }

      const { translations: newTranslations } = await loadResponse.json();
      setTranslations(newTranslations);
      setShowTranslation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  }, [videoId, subtitles]);

  const getTranslation = useCallback(
    (start: number) => {
      return (
        translations.find(t => t.start === Math.floor(start))?.translation ||
        null
      );
    },
    [translations]
  );

  const importTranslations = useCallback(
    async (text: string) => {
      try {
        const lines = text.split('\n').filter(line => line.trim());
        const newTranslations: Translation[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          const timeMatch = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)$/);

          if (timeMatch && i + 1 < lines.length) {
            const time = timeMatch[1];
            const translation = lines[i + 1].trim();
            const seconds = timeToSeconds(time);

            const subtitle = subtitles.find(
              s => Math.abs(s.start - seconds) < 1
            );

            if (subtitle) {
              newTranslations.push({
                start: subtitle.start,
                translation,
              });
            }

            i++;
          }
        }

        setTranslations(prev => {
          const merged = [...prev];
          for (const newTrans of newTranslations) {
            const index = merged.findIndex(t => t.start === newTrans.start);
            if (index !== -1) {
              merged[index] = newTrans;
            } else {
              merged.push(newTrans);
            }
          }
          return merged.sort((a, b) => a.start - b.start);
        });

        return newTranslations;
      } catch (err) {
        console.error('Error importing translations:', err);
        throw err;
      }
    },
    [subtitles]
  );

  const exportTranslations = useCallback(
    (
      format: 'plain' | 'timed',
      content: 'original' | 'translation' = 'original'
    ) => {
      if (content === 'original') {
        if (format === 'plain') {
          return subtitles.map(s => s.text).join('\n\n');
        }
        return subtitles
          .map(s => `${formatDuration(s.start)}\n${s.text}`)
          .join('\n\n');
      }

      if (format === 'plain') {
        return translations
          .map(t => t.translation)
          .filter(Boolean)
          .join('\n\n');
      }

      return translations
        .map(t => `${formatDuration(t.start)}\n${t.translation}`)
        .join('\n\n');
    },
    [translations, subtitles]
  );

  return {
    translations,
    isTranslating,
    error,
    translateSubtitles,
    getTranslation,
    importTranslations,
    exportTranslations,
    showTranslation,
    setShowTranslation
  };
}
