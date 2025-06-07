import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { subtitles } = await req.json();

    if (!subtitles) {
      return NextResponse.json(
        { message: 'Subtitles are required' },
        { status: 400 }
      );
    }

    const { error: summaryError } = await supabase.from('summaries').insert({
      video_id: params.id,
      subtitles,
    });

    if (summaryError) {
      return NextResponse.json(
        { message: 'Failed to save subtitles', error: summaryError.message },
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
