import he from 'he';
import axios from 'axios';
import { find } from 'lodash';
import striptags from 'striptags';

const fetchData = async function fetchData(url: string) {
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      Referer: 'https://www.youtube.com',
      Origin: 'https://www.youtube.com',
    },
  });
  return data;
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

  if (!data.includes('captionTracks')) {
    throw new Error(`Could not find captions for video: ${videoID}`);
  }

  const regex = /"captionTracks":(\[.*?\])/;
  const matchResult = regex.exec(data);
  if (!matchResult) {
    throw new Error(`Could not extract captionTracks`);
  }

  const { captionTracks } = JSON.parse(`{${matchResult[0]}}`);

  let subtitle;
  if (type === 'manual') {
    subtitle = find(captionTracks, { vssId: `.${lang}` });
  } else if (type === 'asr') {
    subtitle = find(captionTracks, { vssId: `a.${lang}` });
  } else {
    subtitle =
      find(captionTracks, { vssId: `a.${lang}` }) ||
      find(captionTracks, { vssId: `.${lang}` });
  }

  if (!subtitle?.baseUrl) {
    throw new Error(`Could not find ${type} captions for ${videoID}`);
  }

  const transcript = await fetchData(subtitle.baseUrl);
  const lines = transcript
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

  return lines;
}
