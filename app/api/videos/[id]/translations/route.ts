import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: translations } = await supabase
      .from('subtitle_translations')
      .select('start_time, translated_text')
      .eq('video_id', params.id);

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
