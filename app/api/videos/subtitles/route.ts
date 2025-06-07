import { NextResponse } from 'next/server';
import { getSubtitles, SubtitleLine } from '@/lib/youtube-captions-scraper';

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'No video ID provided' },
        { status: 400 }
      );
    }

    console.log(`🎯 Fetching subtitles for video ID: ${videoId}`);

    let rawSubtitles: SubtitleLine[] | null = null;

    // Step 1: Try manual subtitles first
    try {
      console.log('🔍 Trying manual subtitles...');
      rawSubtitles = await getSubtitles({
        videoID: videoId,
        lang: 'en',
        type: 'manual',
      });
    } catch (e) {
      console.warn('⚠️ Manual subtitles not found.');
    }

    // Step 2: Fallback to auto subtitles if manual failed
    if (!rawSubtitles) {
      try {
        console.log('🔁 Trying auto-generated subtitles...');
        rawSubtitles = await getSubtitles({
          videoID: videoId,
          lang: 'en',
          type: 'asr',
        });
      } catch (e) {
        console.warn('❌ Auto-generated subtitles also not found.');
      }
    }

    if (!rawSubtitles || rawSubtitles.length === 0) {
      return NextResponse.json(
        {
          error: 'No subtitles available for this video',
          message: 'Neither manual nor auto-generated subtitles were found.',
        },
        { status: 404 }
      );
    }

    const formattedSubtitles = rawSubtitles.map(subtitle => ({
      text: subtitle.text,
      start: parseFloat(subtitle.start),
      duration: parseFloat(subtitle.dur || '0'),
    }));

    return NextResponse.json({ subtitles: formattedSubtitles });
  } catch (error) {
    console.error('🔥 Error in POST /api/videos/subtitles:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch subtitles',
        message: errorMessage,
        details: `Unexpected error occurred. Error: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
