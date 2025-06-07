import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error: highlightsError } = await supabase
      .from('highlights')
      .delete()
      .eq('video_id', params.id);

    if (highlightsError) {
      console.error('Error deleting highlights:', highlightsError);
      throw highlightsError;
    }

    const { error: summaryError } = await supabase
      .from('summaries')
      .delete()
      .eq('video_id', params.id);

    if (summaryError) {
      console.error('Error deleting summaries:', summaryError);
      throw summaryError;
    }

    const { error: videoError } = await supabase
      .from('videos')
      .delete()
      .eq('id', params.id);

    if (videoError) {
      console.error('Error deleting video:', videoError);
      throw videoError;
    }

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
    const updates = await request.json();

    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      {
        message: 'Failed to update video',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
