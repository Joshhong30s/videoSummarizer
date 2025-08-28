import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SubtitleEntry } from '@/lib/types';

async function mergeSummarySubtitles(
  videoId: string,
  newSubtitles: SubtitleEntry[],
  userId?: string
) {
  const { data: summary, error: fetchError } = await supabase
    .from('summaries')
    .select('subtitles')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!summary) {
    const { error: upsertError } = await supabase.from('summaries').upsert(
      {
        video_id: videoId,
        subtitles: newSubtitles,
        user_id: userId,
      },
      {
        onConflict: 'video_id,user_id',
      }
    );

    if (upsertError) throw upsertError;
    return newSubtitles;
  }

  const existingSubtitles = summary?.subtitles || [];
  const mergedSubtitles = [...existingSubtitles];

  newSubtitles.forEach(newSub => {
    const existingIndex = mergedSubtitles.findIndex(
      sub => Math.abs(sub.start - newSub.start) < 1
    );

    if (existingIndex >= 0) {
      mergedSubtitles[existingIndex] = newSub;
    } else {
      mergedSubtitles.push(newSub);
    }
  });

  mergedSubtitles.sort((a, b) => a.start - b.start);

  const { error: updateError } = await supabase.from('summaries').upsert(
    {
      video_id: videoId,
      subtitles: mergedSubtitles,
      user_id: userId,
    },
    {
      onConflict: 'video_id,user_id',
    }
  );

  if (updateError) throw updateError;

  return mergedSubtitles;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { subtitles, userId } = await request.json();
    const { id: videoId } = params;

    if (!Array.isArray(subtitles)) {
      return NextResponse.json(
        { error: 'Invalid subtitles format' },
        { status: 400 }
      );
    }

    const updatedSubtitles = await mergeSummarySubtitles(
      videoId,
      subtitles,
      userId
    );

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
