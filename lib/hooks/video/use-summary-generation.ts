import { useState } from 'react';
import type { SubtitleEntry } from '@/lib/types';

type SummaryModel = 'openai' | 'gemini';

interface GenerateSummaryParams {
  model: SummaryModel;
  videoId: string;
  subtitles: SubtitleEntry[];
}

interface UseSummaryGenerationResult {
  generateSummary: (params: GenerateSummaryParams) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useSummaryGeneration(): UseSummaryGenerationResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateSummary = async ({
    model,
    videoId,
    subtitles,
  }: GenerateSummaryParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/videos/${videoId}/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subtitles, model }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate summary');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate summary');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to generate summary')
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    generateSummary,
    loading,
    error,
  };
}
