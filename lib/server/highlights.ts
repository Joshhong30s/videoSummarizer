import { supabase } from '@/lib/supabase';
import type { Highlight } from '@/lib/types';

export async function getVideoHighlights(
  videoId: string
): Promise<Highlight[]> {
  const { data, error } = await supabase
    .from('highlights')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching highlights:', error);
    return [];
  }

  return data || [];
}
