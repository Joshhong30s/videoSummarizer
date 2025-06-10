// app/api/videos/route.ts 
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { GUEST_USER_ID } from '@/lib/supabase';
import { isValidYoutubeUrl } from '@/lib/utils/url-validation';
import { getVideoId } from '@/lib/utils/youtube';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(req: Request) {
  try {
    // 1. 驗證 NextAuth session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. 解析請求
    const { url, category_ids = [] } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }
    if (!isValidYoutubeUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }
    const videoId = getVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Could not extract video ID' },
        { status: 400 }
      );
    }

    // 3. 檢查是否已存在
    const { data: existingVideo, error: existingError } = await supabaseAdmin
      .from('videos')
      .select('id')
      .eq('youtube_id', videoId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existingVideo) {
      return NextResponse.json(
        { error: 'Video already exists', data: existingVideo },
        { status: 409 }
      );
    }

    // 4. 取得影片資訊
    const origin = new URL(req.url).origin;
    const infoRes = await fetch(`${origin}/api/videos/info?videoId=${videoId}`);
    if (!infoRes.ok) throw new Error('Failed to fetch video info');
    const videoInfo = await infoRes.json();

    // 5. 插入新影片（使用 service_role，跳過 RLS）
    const { error: insertError } = await supabaseAdmin.from('videos').insert({
      youtube_id: videoId,
      title: videoInfo.title,
      thumbnail_url: videoInfo.thumbnailUrl,
      status: 'pending',
      category_ids,
      published_at: videoInfo.publishDate,
      metadata: { duration: videoInfo.duration },
      user_id: session.user.id,
    });
    if (insertError) throw insertError;

    return NextResponse.json(
      { success: true, message: 'Video added successfully' },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error adding video:', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to add video',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || GUEST_USER_ID;

    console.log('Fetching videos for userId:', userId);

    // 使用 service_role client 跳過 RLS
    const { data: videos, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`Found ${videos?.length || 0} videos for user ${userId}`);
    return NextResponse.json({ data: videos });
  } catch (err) {
    console.error('Error fetching videos:', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to fetch videos',
      },
      { status: 500 }
    );
  }
}
