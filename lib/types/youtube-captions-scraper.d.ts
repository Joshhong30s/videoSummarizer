declare module 'youtube-captions-scraper' {
  interface GetCaptionsResponse {
    dur: string;
    start: string;
    text: string;
  }

  interface GetCaptionsOptions {
    lang?: string;
    videoID: string;
    type?: 'auto' | 'asr';
  }

  export function getSubtitles(
    options: GetCaptionsOptions
  ): Promise<GetCaptionsResponse[]>;
}
