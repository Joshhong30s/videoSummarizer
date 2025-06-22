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
  rank: number;
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

    // Fetch search results
    const { data: resultsData, error: resultsError } = await supabaseAdmin.rpc(
      'search_video_content',
      {
        search_query: params.query,
        content_types:
          effectiveContentTypes.length > 0
            ? effectiveContentTypes
            : ALL_CONTENT_TYPES,
        category_ids: params.categoryIds?.map(String),
        start_time: params.timeRange?.start,
        end_time: params.timeRange?.end,
        user_id: userId,
        _page: params.page,
        _limit: params.limit,
      }
    );

    if (resultsError) {
      console.error('Search results error:', resultsError);
      return NextResponse.json(
        { error: 'search failed', details: resultsError.message },
        { status: 500 }
      );
    }

    // Fetch total count
    const { data: totalCountData, error: totalCountError } =
      await supabaseAdmin.rpc('get_search_total_count', {
        search_query: params.query,
        content_types:
          effectiveContentTypes.length > 0
            ? effectiveContentTypes
            : ALL_CONTENT_TYPES,
        category_ids: params.categoryIds?.map(String),
        start_time: params.timeRange?.start,
        end_time: params.timeRange?.end,
        user_id: userId,
      });

    if (totalCountError) {
      console.error('Search total count error:', totalCountError);
      return NextResponse.json(
        { error: 'search failed', details: totalCountError.message },
        { status: 500 }
      );
    }

    const results = (resultsData || []) as SearchResponseItem[];
    const total = totalCountData as number;
    const hasMore = params.page * params.limit < total;

    const formattedResults = results.map(result => ({
      ...result,
      content: highlightMatchedText(result.content, params.query),
      video_title: highlightMatchedText(result.video_title, params.query),
    }));

    return NextResponse.json({
      results: formattedResults,
      total,
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
