import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/database';

interface VideoMetadataProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: VideoMetadataProps): Promise<Metadata> {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  try {
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', params.id)
      .single();

    if (videoError || !video) {
      return {
        title: 'Video Not Found',
        description: 'The requested video could not be found.',
      };
    }

    const { data: summary } = await supabase
      .from('summaries')
      .select('*')
      .eq('video_id', params.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let description = 'No summary available yet.';
    if (summary?.en_summary) {
      description = summary.en_summary.split('\n')[0].slice(0, 200) + '...';
    } else if (summary?.zh_summary) {
      description = summary.zh_summary.split('\n')[0].slice(0, 200) + '...';
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`;

    return {
      title: `${video.title} | Video Summary`,
      description,
      openGraph: {
        title: video.title,
        description,
        type: 'video.other',
        images: [
          {
            url: thumbnailUrl,
            width: 1280,
            height: 720,
            alt: video.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: video.title,
        description,
        images: [thumbnailUrl],
      },
      alternates: {
        canonical: `/video/${params.id}`,
      },
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    };
  } catch {
    return {
      title: 'Video Summary',
      description: 'View video summaries and highlights.',
    };
  }
}
