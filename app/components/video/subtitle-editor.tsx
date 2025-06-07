'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Modal } from '@/app/components/ui/modal';
import { SubtitleEntry } from '@/lib/types';
import { formatDuration } from '@/lib/utils/format-time';

interface SubtitleEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subtitles: SubtitleEntry[]) => Promise<void>;
  initialSubtitles?: SubtitleEntry[];
}

interface ParsedSubtitle {
  start: number;
  text: string;
}

const convertTimeToSeconds = (timeStr: string): number => {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
};

const parseSubtitles = (text: string): ParsedSubtitle[] => {
  const lines = text.trim().split('\n');
  const subtitles: ParsedSubtitle[] = [];
  let currentTime: number | null = null;
  let currentText: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      if (currentTime !== null && currentText.length > 0) {
        subtitles.push({
          start: currentTime,
          text: currentText.join(' '),
        });
        currentTime = null;
        currentText = [];
      }
      continue;
    }

    // Try to parse as timestamp (MM:SS)
    const timeMatch = trimmedLine.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      if (currentTime !== null && currentText.length > 0) {
        subtitles.push({
          start: currentTime,
          text: currentText.join(' '),
        });
        currentText = [];
      }
      currentTime = convertTimeToSeconds(trimmedLine);
    } else if (currentTime !== null) {
      currentText.push(trimmedLine);
    }
  }

  // Add the last subtitle if exists
  if (currentTime !== null && currentText.length > 0) {
    subtitles.push({
      start: currentTime,
      text: currentText.join(' '),
    });
  }

  return subtitles.sort((a, b) => a.start - b.start);
};

const convertToSubtitleEntries = (
  parsed: ParsedSubtitle[]
): SubtitleEntry[] => {
  return parsed.map((item, index) => {
    const duration =
      index < parsed.length - 1 ? parsed[index + 1].start - item.start : 5; // Default duration of 5 seconds for the last subtitle

    return {
      start: item.start,
      duration,
      text: item.text,
    };
  });
};

const formatSubtitlesForDisplay = (subtitles: SubtitleEntry[]): string => {
  return subtitles
    .map(sub => {
      // Convert seconds to MM:SS format
      const minutes = Math.floor(sub.start / 60);
      const seconds = Math.floor(sub.start % 60);
      const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      return `${timeStr}\n${sub.text}\n`;
    })
    .join('\n');
};

const formatTimeDisplay = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export function SubtitleEditor({
  isOpen,
  onClose,
  onSave,
  initialSubtitles = [],
}: SubtitleEditorProps) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<SubtitleEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubtitles.length > 0) {
      setText(formatSubtitlesForDisplay(initialSubtitles));
    }
  }, [initialSubtitles]);

  const handleTextChange = (value: string) => {
    setText(value);
    try {
      const parsed = parseSubtitles(value);
      const entries = convertToSubtitleEntries(parsed);
      setPreview(entries);
      setError(null);
    } catch (err) {
      setError('Invalid subtitle format');
      setPreview([]);
    }
  };

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      await onSave(preview);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      title="Edit Subtitles"
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-6xl"
    >
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4 h-[60vh]">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">
              Enter Subtitles
            </h3>
            <div className="text-xs text-gray-500">
              Format: MM:SS newline Subtitle content blank line
            </div>
            <textarea
              value={text}
              onChange={e => handleTextChange(e.target.value)}
              className="w-full h-full p-3 font-mono text-sm border rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`17:03\norders so I'm going to take this get\n\n17:04\ninventory and I'm going to copy and\n`}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Preview</h3>
            <div className="h-full p-3 border rounded overflow-y-auto bg-gray-50">
              {preview.map((sub, index) => (
                <div
                  key={index}
                  className="mb-4 p-2 bg-white rounded shadow-sm"
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {formatTimeDisplay(sub.start)} -{' '}
                    {formatTimeDisplay(sub.start + sub.duration)}
                  </div>
                  <div className="text-sm">{sub.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isProcessing || preview.length === 0}
          >
            {isProcessing ? 'Processing...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
