import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { HomePage } from './components/pages/home-page';
import { VideoPlayerProvider } from '@/lib/contexts/video-player-context';
import { VideosProvider } from '@/lib/contexts/videos-context';

export const dynamic = 'force-dynamic';

interface HomeProps {
  searchParams?: {
    query?: string;
    category?: string;
    page?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = createServerComponentClient({ cookies });

  // Get initial videos
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })
    .range(0, 11);

  return (
    <div className="container mx-auto mt-8 max-w-7xl px-4">
      <VideoPlayerProvider>
        <VideosProvider initialVideos={videos || []}>
          <HomePage />
        </VideosProvider>
      </VideoPlayerProvider>
    </div>
  );
}
