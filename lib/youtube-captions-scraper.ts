import he from 'he';
import axios from 'axios';
import { find } from 'lodash';
import striptags from 'striptags';

const fetchData = async function fetchData(url: string) {
  const cookie = process.env.YT_COOKIE;
  console.log('[captions] cookie length', cookie?.length ?? 0);
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      Referer: 'https://www.youtube.com',
      Origin: 'https://www.youtube.com',
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });
  return data;
};

const withCaptionFormat = (url: string, format: string) => {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('fmt', format);
    return parsed.toString();
  } catch {
    if (url.includes('fmt=')) {
      return url.replace(/fmt=[^&]+/, `fmt=${format}`);
    }
    return `${url}&fmt=${format}`;
  }
};

const parseTranscriptXml = (transcript: string) =>
  transcript
    .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
    .replace('</transcript>', '')
    .split('</text>')
    .filter(Boolean)
    .map((line: string) => {
      const start = /start="([\d.]+)"/.exec(line)?.[1];
      const dur = /dur="([\d.]+)"/.exec(line)?.[1];
      const htmlText = line.replace(/<text.+?>/, '').replace(/<\/?[^>]+>/g, '');
      const decodedText = he.decode(htmlText);
      const text = striptags(decodedText);

      if (!start || !dur) {
        throw new Error('Failed to parse subtitle line.');
      }

      return { start, dur, text };
    });

const parseVttToLines = (vtt: string): SubtitleLine[] => {
  const lines = vtt
    .replace(/\r/g, '')
    .replace(/^\uFEFF/, '')
    .split('\n');

  const cues: SubtitleLine[] = [];
  let i = 0;

  const toSeconds = (time: string) => {
    const [h, m, s] = time.split(':');
    const [sec, ms = '0'] = (s || '').split('.');
    return (
      Number(h) * 3600 + Number(m) * 60 + Number(sec) + Number(ms) / 1000
    );
  };

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || line === 'WEBVTT') {
      i += 1;
      continue;
    }

    if (/^\d+$/.test(line)) {
      i += 1;
    }

    const timeLine = (lines[i] || '').trim();
    const timeMatch = timeLine.match(
      /^(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/
    );
    if (!timeMatch) {
      i += 1;
      continue;
    }

    const start = toSeconds(timeMatch[1]);
    const end = toSeconds(timeMatch[2]);
    i += 1;

    const textLines: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      const cleaned = striptags(he.decode(lines[i])).replace(/\s+/g, ' ').trim();
      if (cleaned) textLines.push(cleaned);
      i += 1;
    }

    const text = textLines.join(' ').trim();
    if (text) {
      cues.push({
        start: String(start),
        dur: String(Math.max(0, end - start)),
        text,
      });
    }

    i += 1;
  }

  return cues;
};

const fetchTimedTextTrackList = async (videoId: string) => {
  const url = `https://www.youtube.com/api/timedtext?type=list&v=${encodeURIComponent(
    videoId
  )}`;
  const xmlText = await fetchData(url);
  const trackRegex = /<track\b([^>]+?)\/?>(?:<\/track>)?/g;
  const attrRegex = /(\w+)="([^"]*)"/g;
  const tracks: Array<{ langCode: string; kind?: string; name?: string }> = [];
  let trackMatch;
  while ((trackMatch = trackRegex.exec(xmlText))) {
    const attrs: Record<string, string> = {};
    let attrMatch;
    while ((attrMatch = attrRegex.exec(trackMatch[1]))) {
      attrs[attrMatch[1]] = attrMatch[2];
    }
    const langCode = attrs.lang_code || '';
    if (!langCode) continue;
    tracks.push({ langCode, kind: attrs.kind, name: attrs.name });
  }
  return tracks;
};

const fetchVttFromTimedText = async (
  videoId: string,
  track: { langCode: string; kind?: string; name?: string }
) => {
  const params = new URLSearchParams();
  params.set('v', videoId);
  params.set('fmt', 'vtt');
  params.set('lang', track.langCode);
  if (track.kind) params.set('kind', track.kind);
  if (track.name) params.set('name', track.name);
  const url = `https://www.youtube.com/api/timedtext?${params.toString()}`;
  return fetchData(url);
};

export type SubtitleLine = {
  start: string;
  dur: string;
  text: string;
};

export async function getSubtitles({
  videoID,
  lang = 'en',
  type = 'any',
}: {
  videoID: string;
  lang?: string;
  type?: 'manual' | 'asr' | 'any';
}): Promise<SubtitleLine[]> {
  const data = await fetchData(`https://youtube.com/watch?v=${videoID}`);

  const extractCaptionTracks = () => {
    if (!data.includes('captionTracks')) return null;
    const regex = /"captionTracks":(\[.*?\])/;
    const matchResult = regex.exec(data);
    if (matchResult) {
      try {
        const { captionTracks } = JSON.parse(`{${matchResult[0]}}`);
        return captionTracks;
      } catch {
        return null;
      }
    }

    const playerMatch = data.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
    if (playerMatch?.[1]) {
      try {
        const player = JSON.parse(playerMatch[1]);
        return (
          player?.captions?.playerCaptionsTracklistRenderer?.captionTracks ||
          null
        );
      } catch {
        return null;
      }
    }

    return null;
  };

  const captionTracks = extractCaptionTracks() || [];
  console.log('[captions] captionTracks length', captionTracks.length);

  let subtitle;
  if (captionTracks.length) {
    if (type === 'manual') {
      subtitle = find(captionTracks, { vssId: `.${lang}` });
    } else if (type === 'asr') {
      subtitle = find(captionTracks, { vssId: `a.${lang}` });
    } else {
      subtitle =
        find(captionTracks, { vssId: `a.${lang}` }) ||
        find(captionTracks, { vssId: `.${lang}` });
    }
  }

  let lines: SubtitleLine[] = [];

  if (subtitle?.baseUrl) {
    console.log('[captions] using baseUrl', subtitle.baseUrl);
    const fmtBaseUrl = withCaptionFormat(subtitle.baseUrl, 'srv1');
    let transcript = await fetchData(fmtBaseUrl);
    console.log('[captions] baseUrl fmt=srv1 length', transcript.length);

    if (transcript.trim().startsWith('WEBVTT')) {
      lines = parseVttToLines(transcript);
    } else {
      lines = parseTranscriptXml(transcript);
    }
    console.log('[captions] lines after srv1 parse', lines.length);

    if (!lines.length && fmtBaseUrl !== subtitle.baseUrl) {
      transcript = await fetchData(subtitle.baseUrl);
      console.log('[captions] baseUrl raw length', transcript.length);
      if (transcript.trim().startsWith('WEBVTT')) {
        lines = parseVttToLines(transcript);
      } else {
        lines = parseTranscriptXml(transcript);
      }
      console.log('[captions] lines after raw parse', lines.length);
    }
  }

  if (!lines.length) {
    const tracks = await fetchTimedTextTrackList(videoID);
    console.log('[captions] timedtext tracks', tracks);
    const preferred =
      tracks.find(t => t.langCode?.startsWith(lang)) ||
      tracks.find(t => t.langCode?.startsWith('en')) ||
      tracks[0];

    if (preferred) {
      const vtt = await fetchVttFromTimedText(videoID, preferred);
      console.log('[captions] timedtext vtt length', vtt.length);
      lines = parseVttToLines(vtt);
      console.log('[captions] lines after timedtext', lines.length);
    }
  }

  if (!lines.length) {
    throw new Error(`Could not find ${type} captions for ${videoID}`);
  }

  return lines;
}
