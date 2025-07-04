'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useHighlightsContext } from '@/lib/contexts/highlights-context';
import { useSubtitleTranslation } from '@/lib/hooks/video/use-subtitle-translation';
import { useSubtitleRange } from '@/lib/hooks/video/use-subtitle-range';
import { SubtitleLine } from './subtitle-line';
import { Button } from '@/app/components/ui/button';
import { Languages, Loader2, Copy, FileText, Upload, Plus } from 'lucide-react';
import { SubtitleEditor } from '@/app/components/video/subtitle-editor';
import type { VideoDetail, SubtitleEntry } from '@/lib/types/video';
import type { Highlight, HighlightCreate } from '@/lib/types/core';

interface SubtitlesViewProps {
  video: VideoDetail;
}

interface TranslationExport {
  format: 'plain' | 'timed';
  content: 'original' | 'translation';
}

export function SubtitlesView({ video }: SubtitlesViewProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [subtitleCount, setSubtitleCount] = useState(0);
  const [lastCopiedButton, setLastCopiedButton] = useState<
    'plain' | 'timed' | null
  >(null);
  const [currentSubtitles, setCurrentSubtitles] = useState<SubtitleEntry[]>(
    video.summary?.subtitles || []
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showLongLoadMessage, setShowLongLoadMessage] = useState(false);

  const { highlights, addHighlight, removeHighlight } = useHighlightsContext();

  const { range, setRange, maxMinute, filteredSubtitles } =
    useSubtitleRange(currentSubtitles);

  const {
    translations,
    isTranslating,
    translateSubtitles,
    getTranslation,
    importTranslations,
    exportTranslations,
    showTranslation,
    setShowTranslation,
  } = useSubtitleTranslation({
    videoId: video.id,
    subtitles: filteredSubtitles,
  });

  useEffect(() => {
    if (filteredSubtitles) {
      setSubtitleCount(filteredSubtitles.length);
    }

    if (isInitialLoad) {
      setIsInitialLoad(false);
    }

    const timer = setTimeout(() => {
      if (
        currentSubtitles.length === 0 &&
        (video.status === 'pending' || video.status === 'processing')
      ) {
        setShowLongLoadMessage(true);
      }
    }, 20000);

    return () => clearTimeout(timer);
  }, [filteredSubtitles, isInitialLoad, currentSubtitles.length, video.status]);

  const handleHighlightCreate = useCallback(
    async (subtitle: SubtitleEntry) => {
      try {
        console.log('Received input:', subtitle);
        const startOffset = Math.floor(subtitle.start);
        const endOffset = Math.floor(subtitle.start + subtitle.duration);

        await addHighlight({
          video_id: video.id,
          start_offset: startOffset,
          end_offset: endOffset,
          content: subtitle.text,
          type: 'subtitle',
          color: '#FFD700',
        });
      } catch (err) {
        console.error('Detailed error adding highlight:', err);
      }
    },
    [addHighlight, video.id]
  );

  const handleHighlightDelete = useCallback(
    async (start: number) => {
      const startOffset = Math.floor(start);
      const highlight = highlights.find(
        (h: Highlight) => h.start_offset === startOffset
      );
      if (highlight) {
        try {
          await removeHighlight(highlight.id);
        } catch (err) {
          console.error('Error removing highlight:', err);
          // TODO: Add toast notification for error
        }
      }
    },
    [highlights, removeHighlight]
  );

  const handleImport = useCallback(async () => {
    try {
      await importTranslations(importText);
      setShowImportModal(false);
      setImportText('');
      setShowTranslation(true);
    } catch (err) {
      console.error('Error importing translations:', err);
    }
  }, [importText, importTranslations]);

  const handleCopyWithFormat = useCallback(
    async (
      format: 'plain' | 'timed',
      content: 'original' | 'translation' = 'original'
    ) => {
      const text = exportTranslations(format, content);
      await navigator.clipboard.writeText(text);
      setLastCopiedButton(format);
      setTimeout(() => setLastCopiedButton(null), 1500);
    },
    [exportTranslations]
  );

  const handleSaveSubtitles = async (newSubtitles: SubtitleEntry[]) => {
    try {
      const response = await fetch(`/api/videos/${video.id}/subtitles`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subtitles: newSubtitles }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update subtitles');
      }

      const { subtitles } = await response.json();

      // Update local state
      setCurrentSubtitles(subtitles);
    } catch (error) {
      console.error('Failed to update subtitles:', error);
      throw error;
    }
  };

  if (!currentSubtitles.length) {
    const showFetching =
      video.status === 'pending' || video.status === 'processing';
    const message =
      showFetching && !showLongLoadMessage
        ? 'Fetching subtitles...'
        : 'No subtitles available for this video. You can try adding them manually.';

    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
        <p className="mb-4 font-bold text-gray-600">{message}</p>
        <Button
          onClick={() => setShowEditModal(true)}
          variant="outline"
          className="flex items-center gap-2"
          disabled={showFetching && !showLongLoadMessage}
        >
          <Plus className="h-4 w-4" />
          Add Subtitles Manually
        </Button>
        {showEditModal && (
          <SubtitleEditor
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveSubtitles}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">
            Select time range (minutes): {range[0]} - {range[1]}
          </p>
          <span className="text-sm text-gray-500">
            {subtitleCount} subtitles selected
          </span>
        </div>
        <div className="px-2">
          <input
            type="range"
            min={0}
            max={maxMinute}
            step={1}
            value={range[0]}
            onChange={e => setRange([Number(e.target.value), range[1]])}
            className="w-full"
          />
          <input
            type="range"
            min={0}
            max={maxMinute}
            step={1}
            value={range[1]}
            onChange={e => setRange([range[0], Number(e.target.value)])}
            className="w-full"
          />
        </div>

        {lastCopiedButton === 'plain' && (
          <div className="relative bottom-0 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800/95 text-white text-sm rounded shadow-lg backdrop-blur-sm animate-in fade-in duration-300 text-nowrap z-50 w-24 text-center">
            Sub Copied!
          </div>
        )}

        {lastCopiedButton === 'timed' && (
          <div className="relative bottom-0 left-1/3 -translate-x-1/2 px-2 py-1 bg-gray-800/95 text-white text-sm rounded shadow-lg backdrop-blur-sm animate-in fade-in duration-300 text-nowrap z-50 w-52 text-center">
            Sub with TimeStamp Copied!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            id="show-translation"
            checked={showTranslation}
            onChange={e => setShowTranslation(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="show-translation" className="text-sm text-gray-600">
            Show Translation
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 relative overflow-x-auto w-full sm:w-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <Button
            variant="ghost"
            onClick={() => setShowEditModal(true)}
            className="text-gray-600 hover:text-blue-700 whitespace-nowrap"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Edit Subtitles</span>
            <span className="sm:hidden">Edit</span>
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              title="Copy Plain Text"
              onClick={() => handleCopyWithFormat('plain', 'original')}
              className="p-2 min-w-[40px] justify-center text-gray-600 hover:text-blue-700"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              title="Copy Text with Timestamps"
              onClick={() => handleCopyWithFormat('timed', 'original')}
              className="p-2 min-w-[40px] justify-center text-gray-600 hover:text-blue-700"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            title="Import Translation"
            onClick={() => setShowImportModal(true)}
            className="p-2 min-w-[40px] justify-center text-gray-600 hover:text-blue-700"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => translateSubtitles()}
            disabled={isTranslating || subtitleCount === 0}
            className="
              inline-flex items-center gap-2 px-4 py-2 
              text-sm font-medium text-gray-700 hover:text-blue-700
              bg-white border border-gray-300 rounded-md
              hover:bg-gray-50 whitespace-nowrap
              disabled:opacity-50 disabled:cursor-not-allowed
              min-w-[40px] sm:min-w-fit
            "
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Translating...</span>
              </>
            ) : (
              <>
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">
                  Translate ({subtitleCount})
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        {filteredSubtitles.map(subtitle => (
          <SubtitleLine
            key={subtitle.start}
            subtitle={subtitle}
            translation={
              showTranslation ? getTranslation(subtitle.start) : null
            }
            highlighted={highlights.some(
              (h: Highlight) => h.start_offset === Math.floor(subtitle.start)
            )}
            onHighlight={() => handleHighlightCreate(subtitle)}
            onUnhighlight={() => handleHighlightDelete(subtitle.start)}
          />
        ))}
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 space-y-4 border bg-white p-6 shadow-lg duration-200 rounded-lg">
            <h3 className="text-lg font-semibold">Import Translation</h3>
            <p className="text-sm text-gray-600">
              Please paste the translation text with timestamps in the following
              format:
            </p>
            <pre className="p-2 text-sm bg-gray-50 rounded">
              {`00:00
This is the first translation

00:05
This is the second translation`}
            </pre>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="w-full h-64 p-3 border rounded"
              placeholder="Paste translation text with timestamps..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport}>Import</Button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <SubtitleEditor
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveSubtitles}
          initialSubtitles={currentSubtitles}
        />
      )}
    </div>
  );
}
