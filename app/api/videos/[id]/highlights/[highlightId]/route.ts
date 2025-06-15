import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Highlight } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
    highlightId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    console.log(
      'Fetching highlight:',
      params.highlightId,
      'for video:',
      params.id
    );
    const { data, error } = await supabase
      .from('highlights')
      .select('*')
      .eq('id', params.highlightId)
      .eq('video_id', params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<Highlight>(data);
  } catch (error) {
    console.error('Error fetching highlight:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlight' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const updates = await request.json();

    delete updates.video_id;

    const { data, error } = await supabase
      .from('highlights')
      .update(updates)
      .eq('id', params.highlightId)
      .eq('video_id', params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<Highlight>(data);
  } catch (error) {
    console.error('Error updating highlight:', error);
    return NextResponse.json(
      { error: 'Failed to update highlight' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { error } = await supabase
      .from('highlights')
      .delete()
      .eq('id', params.highlightId)
      .eq('video_id', params.id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json(
      { error: 'Failed to delete highlight' },
      { status: 500 }
    );
  }
}
