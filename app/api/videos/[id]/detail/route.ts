import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Get both video and summary data
    const [videoResult, summaryResult] = await Promise.all([
      supabaseAdmin.from('videos').select('*').eq('id', params.id).single(),
      supabaseAdmin
        .from('summaries')
        .select('*')
        .eq('video_id', params.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (videoResult.error) {
      console.error('Error fetching video:', videoResult.error);
      throw videoResult.error;
    }

    if (!videoResult.data) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (
      session?.user?.id !== videoResult.data.user_id &&
      videoResult.data.user_id !== '00000000-0000-0000-0000-000000000000'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      ...videoResult.data,
      summary: summaryResult.data || null,
    });
  } catch (error) {
    console.error('Error in detail route:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch video details',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
