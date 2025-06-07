// app/api/videos/subtitles/route.ts (Next.js 13 Route Handler)
import { NextResponse } from 'next/server';
import { youtube_v3 } from '@googleapis/youtube';
import axios from 'axios';
import protobuf from 'protobufjs';
import { Buffer } from 'buffer';

const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY!;
const youtubeClient = new youtube_v3.Youtube({ auth: apiKey });

/** 將物件編碼成 base64 的 protobuf，用於 InnerTube API */
function getBase64Protobuf(message: Record<string, any>): string {
  const root = protobuf.Root.fromJSON({
    nested: {
      Message: {
        fields: {
          param1: { id: 1, type: 'string' },
          param2: { id: 2, type: 'string' },
        },
      },
    },
  });
  const MessageType = root.lookupType('Message');
  const buffer = MessageType.encode(message).finish();
  return Buffer.from(buffer).toString('base64');
}

/**
 * 取得影片的預設字幕語言與 trackKind
 */
async function getDefaultSubtitleLanguage(
  videoId: string
): Promise<{ trackKind: string; language: string }> {
  // 1. videos.list 拿 defaultLanguage 或 defaultAudioLanguage
  const videosRes = await youtubeClient.videos.list({
    part: ['snippet'],
    id: [videoId],
  });
  if (!videosRes.data.items?.length) {
    throw new Error(`No video found for ID: ${videoId}`);
  }
  const snippet = videosRes.data.items[0].snippet!;
  const preferredLang =
    snippet.defaultLanguage || snippet.defaultAudioLanguage || 'en';

  // 2. captions.list 拿所有可用字幕 track metadata
  const capsRes = await youtubeClient.captions.list({
    part: ['snippet'],
    videoId,
  });
  const items = capsRes.data.items || [];
  if (!items.length) {
    throw new Error(`No captions metadata for video: ${videoId}`);
  }

  // 優先尋找 preferredLang，否則取第一個
  const pick =
    items.find(c => c.snippet?.language === preferredLang) || items[0];
  const { trackKind, language } = pick.snippet!;
  return { trackKind: trackKind || 'standard', language: language! };
}

/**
 * 呼叫 InnerTube API 取得字幕段落
 */
async function fetchTranscriptSegments(
  videoId: string,
  trackKind: string,
  language: string
) {
  const message = {
    param1: videoId,
    param2: getBase64Protobuf({
      param1: trackKind === 'asr' ? trackKind : null,
      param2: language,
    }),
  };
  const params = getBase64Protobuf(message);

  const url =
    'https://www.youtube.com/youtubei/v1/get_transcript?key=' + apiKey;
  const payload = {
    context: {
      client: { clientName: 'WEB', clientVersion: '2.20240826.01.00' },
    },
    params,
  };
  const { data } = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const segments =
    data.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer
      ?.content?.transcriptSearchPanelRenderer?.body
      ?.transcriptSegmentListRenderer?.initialSegments;
  if (!segments) {
    throw new Error(`Transcript not available for ${videoId}`);
  }

  return segments.map((seg: any) => {
    const line =
      seg.transcriptSectionHeaderRenderer || seg.transcriptSegmentRenderer;
    const startMs = parseInt(line.startMs, 10);
    const endMs = parseInt(line.endMs, 10);
    const textRuns = line.snippet.simpleText
      ? [line.snippet.simpleText]
      : line.snippet.runs.map((r: any) => r.text);
    return {
      start: startMs / 1000,
      duration: (endMs - startMs) / 1000,
      text: textRuns.join(''),
    };
  });
}

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();
    if (!videoId) {
      return NextResponse.json(
        { error: 'No videoId provided' },
        { status: 400 }
      );
    }

    // Step A: 先用 Data API 確認 trackKind & language
    const { trackKind, language } = await getDefaultSubtitleLanguage(videoId);

    // Step B: 呼叫 InnerTube 取字幕
    const subtitles = await fetchTranscriptSegments(
      videoId,
      trackKind,
      language
    );

    if (!subtitles.length) {
      return NextResponse.json(
        { error: 'No subtitles found', message: 'Empty transcript' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subtitles });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ subtitle fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch subtitles', message: msg },
      { status: 500 }
    );
  }
}
