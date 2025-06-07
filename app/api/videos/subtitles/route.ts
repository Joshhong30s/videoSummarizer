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

    let rawSubtitles = null;
    
    // 1. 嘗試獲取手動字幕
    console.log('Attempting to fetch manual subtitles...');
    try {
      const manualSubtitles = await getSubtitles({
        videoID: videoId,
        lang: 'en',
      });

      if (manualSubtitles && manualSubtitles.length > 0) {
        console.log('Successfully fetched manual subtitles');
        rawSubtitles = manualSubtitles;
      } else {
        console.log('No manual subtitles available');
      }
    } catch (error) {
      console.log('Failed to fetch manual subtitles:', error);
    }

    // 2. 如果沒有手動字幕，嘗試獲取自動字幕
    if (!rawSubtitles) {
      console.log('Attempting to fetch auto-generated subtitles...');
      try {
        const autoSubtitles = await getSubtitles({
          videoID: videoId,
          lang: 'en',
          type: 'asr',
        });

        if (autoSubtitles && autoSubtitles.length > 0) {
          console.log('Successfully fetched auto-generated subtitles');
          rawSubtitles = autoSubtitles;
        } else {
          console.log('No auto-generated subtitles available');
        }
      } catch (error) {
        console.error('Failed to fetch auto-generated subtitles:', error);
        throw new Error('No subtitles available for this video');
      }
    }

    if (!rawSubtitles) {
      throw new Error('No subtitles available for this video');
    }

    const formattedSubtitles = rawSubtitles.map(subtitle => ({
      text: subtitle.text,
      start: parseFloat(subtitle.start),
      duration: parseFloat(subtitle.dur || '0'),
    }));

    return NextResponse.json({ subtitles: formattedSubtitles });
  } catch (error) {
    console.error('Error fetching subtitles:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch subtitles',
        message: errorMessage,
        details: `Tried both manual and auto-generated subtitles but failed. Error: ${errorMessage}`
      },
      { status: 500 }
    );
  }
}
