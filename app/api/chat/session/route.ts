import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const videoId = req.nextUrl.searchParams.get('videoId');
  if (!userId || !videoId) {
    return NextResponse.json({ sessionId: null });
  }
  const { data: sessionRow } = await supabaseAdmin
    .from('chat_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('metadata->>videoId', videoId)
    .maybeSingle();
  console.log('sessionRow:', sessionRow);
  if (sessionRow) {
    return NextResponse.json({ sessionId: sessionRow.id });
  }
  return NextResponse.json({ sessionId: null });
}
