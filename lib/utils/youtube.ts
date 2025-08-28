interface VideoInfo {
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
}

export function getVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }

    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;

      if (urlObj.pathname.startsWith('/embed/')) {
        return urlObj.pathname.split('/')[2];
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo | null> {
  try {
    const response = await fetch(`/api/videos/info?videoId=${videoId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch video info');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching video info:', error);
    return null;
  }
}

export function formatVideoDuration(duration: number): string {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getVideoThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}
