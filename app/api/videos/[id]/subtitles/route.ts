import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SubtitleEntry } from '@/lib/types';

async function mergeSummarySubtitles(
  videoId: string,
  newSubtitles: SubtitleEntry[]
) {
  // 1. Get existing summary
  const { data: summary, error: fetchError } = await supabase
    .from('summaries')
    .select('subtitles')
    .eq('video_id', videoId)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      // Create new if not exists
      const { error: insertError } = await supabase.from('summaries').insert({
        video_id: videoId,
        subtitles: newSubtitles,
        en_summary: '',
        zh_summary: '',
      });

      if (insertError) throw insertError;
      return newSubtitles;
    }
    throw fetchError;
  }

  // 2. Merge subtitles
  const existingSubtitles = summary?.subtitles || [];
  const mergedSubtitles = [...existingSubtitles];

  // Update or insert subtitles based on timestamp
  newSubtitles.forEach(newSub => {
    const existingIndex = mergedSubtitles.findIndex(
      sub => Math.abs(sub.start - newSub.start) < 1 // Allow 1 second difference
    );

    if (existingIndex >= 0) {
      // Update existing subtitle
      mergedSubtitles[existingIndex] = newSub;
    } else {
      // Insert new subtitle
      mergedSubtitles.push(newSub);
    }
  });

  // 3. Sort by time
  mergedSubtitles.sort((a, b) => a.start - b.start);

  // 4. Update database
  const { error: updateError } = await supabase
    .from('summaries')
    .update({ subtitles: mergedSubtitles })
    .eq('video_id', videoId);

  if (updateError) throw updateError;

  return mergedSubtitles;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { subtitles } = await request.json();
    const { id: videoId } = params;

    if (!Array.isArray(subtitles)) {
      return NextResponse.json(
        { error: 'Invalid subtitles format' },
        { status: 400 }
      );
    }

    const updatedSubtitles = await mergeSummarySubtitles(videoId, subtitles);

    return NextResponse.json({
      subtitles: updatedSubtitles,
    });
  } catch (error) {
    console.error('Error updating subtitles:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to update subtitles',
      },
      { status: 500 }
    );
  }
}
