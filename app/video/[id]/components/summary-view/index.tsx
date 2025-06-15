'use client';

import { useEffect, useState } from 'react';
import type { VideoDetail } from '@/lib/types';
import { useSummaryGeneration } from '@/lib/hooks/video/use-summary-generation';
import { SummarySection } from './summary-section';
import { Modal } from '@/app/components/ui';

type SummaryModel = 'openai' | 'gemini';

interface ModelSelectionModalProps {
  isOpen: boolean;
  onSelect: (model: SummaryModel) => void;
  onClose: () => void;
}

function ModelSelectionModal({
  isOpen,
  onSelect,
  onClose,
}: ModelSelectionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Summary Model">
      <div className="space-y-4 p-4">
        <button
          onClick={() => onSelect('openai')}
          className="w-full p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <h3 className="font-medium mb-1">OpenAI GPT-3.5</h3>
          <p className="text-sm text-gray-500">
            {' '}
            Recommended for complex or professional video content
          </p>
        </button>
        <button
          onClick={() => onSelect('gemini')}
          className="w-full p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <h3 className="font-medium mb-1">Google Gemini</h3>
          <p className="text-sm text-gray-500">
            Suitable for general or simple video content
          </p>
        </button>
      </div>
    </Modal>
  );
}

interface SummaryViewProps {
  video: VideoDetail;
  onSummaryChange?: () => void;
}

export function SummaryView({ video, onSummaryChange }: SummaryViewProps) {
  const { generateSummary, loading, error } = useSummaryGeneration();
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);

  useEffect(() => {
    if (
      !hasAttempted &&
      !video.summary?.zh_summary &&
      video.summary?.subtitles
    ) {
      setIsModelSelectionOpen(true);
    }
  }, [hasAttempted, video.summary?.zh_summary, video.summary?.subtitles]);

  const handleModelSelect = async (model: SummaryModel) => {
    setIsModelSelectionOpen(false);
    setHasAttempted(true);
    if (video.summary?.subtitles) {
      try {
        await generateSummary({
          model,
          videoId: video.id,
          subtitles: video.summary.subtitles,
        });
        onSummaryChange?.();
      } catch (err) {
        console.error('Failed to generate summary:', err);
      }
    }
  };

  if (!video.summary) {
    return (
      <div className="py-8 text-center text-gray-500">
        No summary available for this video yet.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {video.summary.zh_summary && (
          <SummarySection
            title="Chinese Summary"
            content={video.summary.zh_summary}
            lang="zh"
          />
        )}

        {video.summary.en_summary && (
          <SummarySection
            title="English Summary"
            content={video.summary.en_summary}
            lang="en"
          />
        )}

        {video.summary.classification && (
          <SummarySection
            title="Classification"
            content={video.summary.classification}
            lang="en"
          />
        )}

        {!video.summary.zh_summary &&
          !video.summary.en_summary &&
          !video.summary.classification && (
            <div className="py-8 text-center text-gray-500">
              {loading
                ? 'Summaries are being generated...'
                : error
                  ? 'Failed to generate summaries. Please try again.'
                  : 'Summaries are being generated...'}
            </div>
          )}
      </div>

      <ModelSelectionModal
        isOpen={isModelSelectionOpen}
        onSelect={handleModelSelect}
        onClose={() => setIsModelSelectionOpen(false)}
      />
    </>
  );
}
