import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { GUEST_USER_ID } from '@/lib/supabase';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || GUEST_USER_ID;

    // 驗證視頻所有權
    const { data: video, error: videoCheckError } = await supabaseAdmin
      .from('videos')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (videoCheckError) {
      console.error('Error checking video ownership:', videoCheckError);
      return NextResponse.json(
        { message: 'Invalid video ID' },
        { status: 404 }
      );
    }

    if (!video || video.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to save summaries for this video' },
        { status: 403 }
      );
    }

    const { subtitles } = await req.json();

    if (!subtitles) {
      return NextResponse.json(
        { message: 'Subtitles are required' },
        { status: 400 }
      );
    }

    const { error: summaryError } = await supabaseAdmin
      .from('summaries')
      .insert({
        video_id: params.id,
        user_id: userId, // 添加用戶 ID
        subtitles,
      });

    if (summaryError) {
      console.error('Error saving summary:', summaryError);
      return NextResponse.json(
        { 
          message: 'Failed to save subtitles', 
          error: summaryError.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Subtitles saved successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving subtitles:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || GUEST_USER_ID;

    // 驗證視頻所有權
    const { data: video, error: videoCheckError } = await supabaseAdmin
      .from('videos')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (videoCheckError) {
      console.error('Error checking video ownership:', videoCheckError);
      return NextResponse.json(
        { message: 'Invalid video ID' },
        { status: 404 }
      );
    }

    if (!video || video.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to access summaries for this video' },
        { status: 403 }
      );
    }

    const { data: summaries, error } = await supabaseAdmin
      .from('summaries')
      .select('*')
      .eq('video_id', params.id)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching summaries:', error);
      throw error;
    }

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error('Error fetching summaries:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch summaries',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
