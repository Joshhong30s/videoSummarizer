import { NextResponse } from 'next/server';
import { getSubtitles } from '@/lib/youtube-captions-scraper';

export async function GET() {
  try {
    const videoId = process.env.YT_HEALTH_VIDEO_ID || 'W96vTvdiq84';
    const subtitles = await getSubtitles({ videoID: videoId });
    return NextResponse.json({ ok: true, videoId, count: subtitles.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
