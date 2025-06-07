import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isValidYoutubeUrl } from '@/lib/utils/url-validation';
import { getVideoId } from '@/lib/utils/youtube';

export async function POST(req: Request) {
  try {
    const { url, category_ids = [] } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    if (!isValidYoutubeUrl(url)) {
      return NextResponse.json(
        {
          error:
            'Invalid YouTube URL. Please provide a valid YouTube video URL',
        },
        { status: 400 }
      );
    }

    const videoId = getVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Could not extract video ID from URL' },
        { status: 400 }
      );
    }

    // Check if video already exists
    const { data: existingVideo, error: existingVideoError } = await supabase
      .from('videos')
      .select('id, youtube_id')
      .eq('youtube_id', videoId)
      .maybeSingle();

    if (existingVideoError) {
      throw new Error('Database query error');
    }

    if (existingVideo) {
      return NextResponse.json(
        {
          error: 'Video already exists',
          data: existingVideo,
        },
        { status: 409 }
      );
    }

    // Get video info from YouTube using internal API
    const origin = new URL(req.url).origin;
    const infoResponse = await fetch(
      `${origin}/api/videos/info?videoId=${videoId}`
    );

    if (!infoResponse.ok) {
      throw new Error('Failed to fetch video info');
    }

    const videoInfo = await infoResponse.json();

    // Insert operation
    const { error: insertError } = await supabase.from('videos').insert({
      youtube_id: videoId,
      title: videoInfo.title,
      thumbnail_url: videoInfo.thumbnailUrl,
      status: 'pending',
      category_ids,
      published_at: videoInfo.publishDate,
      metadata: {
        duration: videoInfo.duration,
      },
    });

    if (insertError) {
      throw insertError;
    }

    // Return response after successful insertion
    return NextResponse.json(
      {
        success: true,
        message: 'Video added successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding video:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to add video',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch videos',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
