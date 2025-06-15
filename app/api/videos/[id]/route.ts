import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { GUEST_USER_ID } from '@/lib/supabase';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || GUEST_USER_ID;

    console.log('Deleting video:', params.id, 'for user:', userId);

    const { data: video, error: videoCheckError } = await supabaseAdmin
      .from('videos')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (videoCheckError) {
      console.error('Error checking video ownership:', videoCheckError);
      throw videoCheckError;
    }

    if (!video || video.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this video' },
        { status: 403 }
      );
    }

    const { error: highlightsError } = await supabaseAdmin
      .from('highlights')
      .delete()
      .eq('video_id', params.id);

    if (highlightsError) {
      console.error('Error deleting highlights:', highlightsError);
      throw highlightsError;
    }

    const { error: summaryError } = await supabaseAdmin
      .from('summaries')
      .delete()
      .eq('video_id', params.id);

    if (summaryError) {
      console.error('Error deleting summaries:', summaryError);
      throw summaryError;
    }

    const { error: videoError } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId);

    if (videoError) {
      console.error('Error deleting video:', videoError);
      throw videoError;
    }

    console.log('Successfully deleted video and related data');
    return NextResponse.json(
      { message: 'Video and related data deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in delete operation:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete video',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || GUEST_USER_ID;
    const updates = await request.json();

    const { data: video, error: videoCheckError } = await supabaseAdmin
      .from('videos')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (videoCheckError) {
      console.error('Error checking video ownership:', videoCheckError);
      throw videoCheckError;
    }

    if (!video || video.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this video' },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('videos')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating video:', error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in update operation:', error);
    return NextResponse.json(
      {
        message: 'Failed to update video',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
