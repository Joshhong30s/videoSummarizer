import { NextResponse } from 'next/server';
import { getSubtitles } from '@/lib/youtube-captions-scraper';

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

    // 🔁 一次性取得最佳字幕（自動或手動）
    const rawSubtitles = await getSubtitles({ videoID: videoId, lang: 'en' });

    if (!rawSubtitles || rawSubtitles.length === 0) {
      return NextResponse.json(
        {
          error: 'No subtitles available for this video',
          message: 'No matching subtitle track found (auto or manual).',
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
