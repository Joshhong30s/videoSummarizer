import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { GUEST_USER_ID } from '@/lib/supabase';
import type { Highlight, HighlightCreate } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || GUEST_USER_ID;

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
        { error: 'Unauthorized to access highlights for this video' },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('highlights')
      .select('*')
      .eq('video_id', params.id)
      .eq('user_id', userId)
      .order('start_offset', { ascending: true });

    if (error) {
      console.error('Error fetching highlights:', error);
      throw error;
    }

    return NextResponse.json<Highlight[]>(data);
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || GUEST_USER_ID;

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
        { error: 'Unauthorized to create highlights for this video' },
        { status: 403 }
      );
    }

    console.log('Creating highlight for video:', params.id);
    const input = await request.json();
    console.log('Received highlight input:', input);

    const highlightData = {
      video_id: input.video_id,
      user_id: userId,
      content: input.content,
      start_offset: input.start_offset,
      end_offset: input.end_offset,
      type: input.type,
      color: input.color || '#FFD700',
    };

    if (highlightData.video_id !== params.id) {
      return NextResponse.json({ error: 'Video ID mismatch' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('highlights')
      .insert([highlightData])
      .select()
      .single();

    if (error) {
      console.error('Error creating highlight:', error);
      throw error;
    }

    return NextResponse.json<Highlight>(data);
  } catch (error) {
    console.error('Error creating highlight:', error);
    return NextResponse.json(
      { error: 'Failed to create highlight' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || GUEST_USER_ID;

    const url = new URL(request.url);
    const highlightId = url.searchParams.get('highlightId');

    if (!highlightId) {
      return NextResponse.json(
        { error: 'Highlight ID is required' },
        { status: 400 }
      );
    }

    // 驗證用戶對高亮的所有權
    const { data: highlight, error: highlightCheckError } = await supabaseAdmin
      .from('highlights')
      .select('user_id')
      .eq('id', highlightId)
      .eq('video_id', params.id)
      .single();

    if (highlightCheckError || !highlight) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      );
    }

    if (highlight.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this highlight' },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from('highlights')
      .delete()
      .eq('id', highlightId)
      .eq('user_id', userId); // 再次確認用戶權限

    if (error) {
      console.error('Error deleting highlight:', error);
      throw error;
    }

    return NextResponse.json(
      { message: 'Highlight deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json(
      { error: 'Failed to delete highlight' },
      { status: 500 }
    );
  }
}
