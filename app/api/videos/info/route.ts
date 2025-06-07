import { NextRequest } from 'next/server';
import { getVideoId } from '@/lib/utils/youtube';

async function getVideoInfo(videoUrl: string) {
  try {
    console.log('Fetching video info for:', videoUrl);

    // dynamic import to avoid server-side issues with ytdl-core
    const ytdl = require('@distube/ytdl-core');

    const info = await ytdl.getBasicInfo(videoUrl);
    console.log('Video info received:', info.videoDetails.title);

    const thumbnails = info.videoDetails.thumbnails;
    let bestThumbnail = thumbnails[0];

    for (const thumbnail of thumbnails) {
      if (
        !bestThumbnail ||
        (thumbnail.width &&
          bestThumbnail.width &&
          thumbnail.width > bestThumbnail.width)
      ) {
        bestThumbnail = thumbnail;
      }
    }

    const thumbnailUrl =
      bestThumbnail?.url ||
      `https://img.youtube.com/vi/${info.videoDetails.videoId}/maxresdefault.jpg`;

    return {
      title: info.videoDetails.title,
      description: info.videoDetails.description || '',
      thumbnailUrl: thumbnailUrl,
      duration: parseInt(info.videoDetails.lengthSeconds),
      publishDate: info.videoDetails.publishDate,
    };
  } catch (error) {
    console.error('Error fetching video info from ytdl:', {
      error,
      url: videoUrl,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
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
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Failed to fetch video info',
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
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
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Failed to fetch video info',
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
