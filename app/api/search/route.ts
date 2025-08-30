import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { GUEST_USER_ID } from '@/lib/supabase';
import { z } from 'zod';
import { ContentType, ALL_CONTENT_TYPES } from '@/lib/types/search';

const searchParamsSchema = z.object({
  query: z.string().min(1),
  contentTypes: z
    .array(
      z.enum(['all', 'video', 'subtitle', 'summary', 'highlight', 'takeaway'])
    )
    .default([]),
  categoryIds: z.array(z.string()).optional(),
  timeRange: z
    .object({
      start: z.number(),
      end: z.number(),
    })
    .optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
});

interface SearchResponseItem {
  video_id: string;
  video_title: string;
  youtube_id: string;
  thumbnail_url: string;
  content_type: ContentType;
  timestamp: number | null;
  content: string;
  user_id: string;
  category_ids: string[];
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || GUEST_USER_ID;

    const body = await request.json();
    const params = searchParamsSchema.parse(body);

    const effectiveContentTypes = params.contentTypes.includes('all')
      ? ALL_CONTENT_TYPES
      : params.contentTypes;

    const { data: resultsData, error: resultsError } = await supabaseAdmin.rpc(
      'search_video_content_simple',
      {
        search_query: params.query,
        p_user_id: userId,
        page_num: params.page,
        page_limit: params.limit,
      }
    );

    if (resultsError) {
      console.error('Search results error:', resultsError);
      return NextResponse.json(
        { error: 'search failed', details: resultsError.message },
        { status: 500 }
      );
    }

    const results = (resultsData || []) as SearchResponseItem[];
    const total = results.length;
    const hasMore = results.length >= params.limit;

    let filteredResults = results;

    if (
      effectiveContentTypes.length > 0 &&
      !params.contentTypes.includes('all')
    ) {
      filteredResults = results.filter(result =>
        effectiveContentTypes.includes(result.content_type as any)
      );
    }

    if (params.categoryIds && params.categoryIds.length > 0) {
      // For now, this is a placeholder
    }

    const formattedResults = filteredResults.map(result => ({
      ...result,
      content: highlightMatchedText(result.content, params.query),
      video_title: highlightMatchedText(result.video_title, params.query),
    }));

    return NextResponse.json({
      results: formattedResults,
      total: formattedResults.length,
      page: params.page,
      limit: params.limit,
      hasMore,
    });
  } catch (error: any) {
    console.error('Search request error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'invalid search params', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: 'search failed',
        message: error?.message || 'unexpected error',
      },
      { status: 500 }
    );
  }
}

function highlightMatchedText(text: string | null, query: string): string {
  if (!text || !query) return text || '';

  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 0);

  let result = text;
  searchTerms.forEach(term => {
    const escaped = escapeRegExp(term);
    const regex = new RegExp(`(${escaped})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  });

  return result;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
