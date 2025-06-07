import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Highlight, HighlightCreate } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { data, error } = await supabase
      .from('highlights')
      .select('*')
      .eq('video_id', params.id)
      .order('start_offset', { ascending: true });

    if (error) throw error;

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
    console.log('Creating highlight for video:', params.id);
    const input = await request.json();
    console.log('Received highlight input:', input);

    // Transform the input to match database schema
    const highlightData = {
      video_id: input.video_id,
      content: input.content,
      start_offset: input.start_offset,
      end_offset: input.end_offset,
      type: input.type,
      color: input.color || '#FFD700', // Use provided color or default to yellow
    };

    // Ensure the video ID matches the route parameter
    if (highlightData.video_id !== params.id) {
      return NextResponse.json({ error: 'Video ID mismatch' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('highlights')
      .insert([highlightData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<Highlight>(data);
  } catch (error) {
    console.error('Error creating highlight:', error);
    return NextResponse.json(
      { error: 'Failed to create highlight' },
      { status: 500 }
    );
  }
}
