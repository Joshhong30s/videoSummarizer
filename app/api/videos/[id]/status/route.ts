import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from('videos')
      .update({ status })
      .eq('id', params.id);

    if (updateError) {
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
