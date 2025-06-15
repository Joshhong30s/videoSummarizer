import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { GUEST_USER_ID } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
        { error: 'Unauthorized to access translations for this video' },
        { status: 403 }
      );
    }

    const { data: translations, error: translationsError } = await supabaseAdmin
      .from('subtitle_translations')
      .select('start_time, translated_text')
      .eq('video_id', params.id)
      .eq('user_id', userId);

    if (translationsError) {
      console.error('Error fetching translations:', translationsError);
      throw translationsError;
    }

    const formattedTranslations =
      translations?.map(
        (t: { start_time: number; translated_text: string }) => ({
          start: t.start_time,
          translation: t.translated_text,
        })
      ) || [];

    console.log('Fetched translations:', translations?.length);

    return NextResponse.json({ translations: formattedTranslations });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch translations',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
