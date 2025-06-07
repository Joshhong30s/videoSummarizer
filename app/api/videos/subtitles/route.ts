import { NextResponse } from 'next/server';
import { getSubtitles } from 'youtube-captions-scraper';

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();
    if (!videoId) {
      return NextResponse.json(
        { error: 'No video ID provided' },
        { status: 400 }
      );
    }

    let rawSubtitles;
    try {
      const manualSubtitles = await getSubtitles({
        videoID: videoId,
        lang: 'en',
      });

      if (!manualSubtitles || manualSubtitles.length === 0) {
        console.log('Manual captions empty, trying auto-generated...');
        throw new Error('No manual captions');
      }

      rawSubtitles = manualSubtitles;
    } catch (error) {
      console.log('Falling back to auto-generated captions...');

      try {
        const autoSubtitles = await getSubtitles({
          videoID: videoId,
          lang: 'en',
          type: 'asr',
        });

        if (!autoSubtitles || autoSubtitles.length === 0) {
          throw new Error('No auto-generated captions available');
        }

        rawSubtitles = autoSubtitles;
      } catch (secondError) {
        console.error('Failed to get auto-generated captions:', secondError);
        throw new Error('No subtitles available for this video');
      }
    }

    const formattedSubtitles = rawSubtitles.map(subtitle => ({
      text: subtitle.text,
      start: parseFloat(subtitle.start),
      duration: parseFloat(subtitle.dur || '0'),
    }));

    return NextResponse.json({ subtitles: formattedSubtitles });
  } catch (error) {
    console.error('Error fetching subtitles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subtitles' },
      { status: 500 }
    );
  }
}
