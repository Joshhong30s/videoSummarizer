declare module 'youtube-captions-scraper' {
  interface SubtitleOptions {
    videoID: string;
    lang?: string;
  }

  interface RawSubtitle {
    text: string;
    start: string;
    dur: string;
  }

  export function getSubtitles(
    options: SubtitleOptions
  ): Promise<RawSubtitle[]>;
}
