export const YOUTUBE_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'www.youtube.com',
  'm.youtube.com',
] as const;

/**
 * Validates if a given URL is a valid YouTube URL
 * @param urlString - The URL to validate
 * @returns boolean indicating if the URL is a valid YouTube URL
 */
export function isValidYoutubeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return YOUTUBE_DOMAINS.some(domain => url.hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Extracts the video ID from a YouTube URL
 * @param urlString - The YouTube URL to extract the ID from
 * @returns The video ID if found, null otherwise
 */
export function extractVideoId(urlString: string): string | null {
  try {
    const url = new URL(urlString);

    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.slice(1);
      return id || null;
    }

    const videoId = url.searchParams.get('v');
    if (videoId) {
      return videoId;
    }

    return null;
  } catch {
    return null;
  }
}

export interface YoutubeVideoInfo {
  youtube_id: string;
  title: string;
  thumbnail_url: string;
}
