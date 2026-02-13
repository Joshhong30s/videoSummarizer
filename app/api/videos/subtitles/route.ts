import { NextResponse } from 'next/server';
import { getSubtitles } from '@/lib/youtube-captions-scraper';

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();
    if (!videoId) {
      return NextResponse.json(
        { error: 'No videoId provided' },
        { status: 400 }
      );
    }

    const raw = await getSubtitles({ videoID: videoId });
    const subtitles = raw.map(line => ({
      start: parseFloat(line.start),
      duration: parseFloat(line.dur),
      text: line.text,
    }));

    if (!subtitles.length) {
      return NextResponse.json(
        { error: 'No subtitles found', message: 'Empty transcript' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subtitles });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ subtitle fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch subtitles', message: msg },
      { status: 500 }
    );
  }
}
