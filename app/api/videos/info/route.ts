import { getVideoId } from '@/lib/utils/youtube';

function parseISODuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match.map(v => parseInt(v) || 0);
  return h * 3600 + m * 60 + s;
}

async function getVideoInfo(videoUrl: string) {
  try {
    const videoId = getVideoId(videoUrl);
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      throw new Error('Missing YOUTUBE_API_KEY');
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!res.ok || !data.items || data.items.length === 0) {
      throw new Error('Video not found or API error');
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const details = video.contentDetails;

    const thumbnailUrl =
      snippet.thumbnails?.high?.url ||
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    const duration = parseISODuration(details.duration);

    return {
      title: snippet.title,
      description: snippet.description || '',
      thumbnailUrl,
      duration,
      publishDate: snippet.publishedAt,
    };
  } catch (error) {
    console.error('Error fetching video info via YouTube API:', {
      error,
      url: videoUrl,
    });
    throw error;
  }
}

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get('videoId');

    if (!videoId) {
      return new Response('Missing videoId parameter', { status: 400 });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const videoInfo = await getVideoInfo(videoUrl);

    return new Response(JSON.stringify(videoInfo), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Failed to fetch video info',
        details: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return new Response('Missing URL', { status: 400 });
    }

    const videoInfo = await getVideoInfo(url);

    return new Response(JSON.stringify(videoInfo), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Failed to fetch video info',
        details: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
