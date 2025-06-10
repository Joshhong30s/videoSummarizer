import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { GUEST_USER_ID } from '@/lib/supabase';

export async function PATCH(
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
        { error: 'Unauthorized to update this video status' },
        { status: 403 }
      );
    }

    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('videos')
      .update({ status })
      .eq('id', params.id)
      .eq('user_id', userId); // 確保只更新用戶自己的視頻

    if (updateError) {
      console.error('Error updating video status:', updateError);
      return NextResponse.json(
        {
          message: 'Failed to update video status',
          error: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Video status updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating video status:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
