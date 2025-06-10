import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { GUEST_USER_ID } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || GUEST_USER_ID;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || GUEST_USER_ID;

    console.log('Adding category for user:', userId);
    const { name, color } = await req.json();
    console.log('Request content:', { name, color });

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name,
        color: color || '#2563eb',
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }

    console.log('Category added successfully:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to add category:', error);
    return NextResponse.json(
      {
        message: 'Failed to add category',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || GUEST_USER_ID;
    
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category exists and belongs to user
    const { data: existingData } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingData) {
      return NextResponse.json(
        { error: 'Category not found or unauthorized' },
        { status: 404 }
      );
    }

    const updateData = {
      ...existingData,
      ...updates,
      user_id: userId // Ensure user_id doesn't change
    };

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId) // Extra safety check
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    console.log('Category updated successfully:', { id, data });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update category:', error);
    return NextResponse.json(
      {
        message: 'Failed to update category',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || GUEST_USER_ID;
    
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category exists and belongs to user
    const { data: existingData } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingData) {
      return NextResponse.json(
        { error: 'Category not found or unauthorized' },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }

    console.log('Category deleted successfully:', id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete category',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
