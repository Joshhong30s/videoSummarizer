import { NextResponse } from 'next/server';
import { youtube_v3 } from '@googleapis/youtube';
import axios from 'axios';
import protobuf from 'protobufjs';
import { Buffer } from 'buffer';

const apiKey = process.env.YOUTUBE_API_KEY!;
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

async function getDefaultSubtitleLanguage(
  videoId: string
): Promise<{ trackKind: string; language: string }> {
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

  const capsRes = await youtubeClient.captions.list({
    part: ['snippet'],
    videoId,
  });
  const items = capsRes.data.items || [];
  if (!items.length) {
    throw new Error(`No captions metadata for video: ${videoId}`);
  }

  const pick =
    items.find(c => c.snippet?.language === preferredLang) || items[0];
  const { trackKind, language } = pick.snippet!;
  return { trackKind: trackKind || 'standard', language: language! };
}

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

    const { trackKind, language } = await getDefaultSubtitleLanguage(videoId);

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
