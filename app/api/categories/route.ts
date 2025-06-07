import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
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
    console.log('Received add category request');
    const { name, color } = await req.json();
    console.log('Request content:', { name, color });

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        color: color || '#2563eb',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Category added successfully:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API error - Failed to add category:', error);
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
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const { data: existingData } = await supabase
      .from('categories')
      .select('*') // Get all fields
      .eq('id', id)
      .single();

    if (!existingData) {
      throw new Error('Category not found');
    }

    // Update only provided fields, keep others unchanged
    const updateData = {
      ...existingData,
      ...updates,
    };

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update category error:', error);
      throw error;
    }

    console.log('Category updated successfully:', { id, data });
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error - Failed to update category:', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to update category',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const { data: existingData } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingData) {
      throw new Error('Category not found');
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      console.error('Supabase delete category error:', error);
      throw error;
    }

    console.log('Category deleted successfully:', id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('API error - Failed to delete category:', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to delete category',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
