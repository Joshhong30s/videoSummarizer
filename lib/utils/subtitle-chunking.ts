/**
 * Utility functions for chunking subtitles for summary generation
 */

/**
 * Interface for subtitle data
 */
interface SubtitleLine {
  start: number;
  end?: number;
  duration?: number;
  text: string;
}

/**
 * Chunk subtitles into segments based on time or content length
 * @param subtitles Array of subtitle lines
 * @param maxChunkDuration Maximum duration of a chunk in seconds (default: 300 = 5 minutes)
 * @param maxChunkChars Maximum number of characters in a chunk (default: 4000)
 * @returns Array of subtitle chunks
 */
export function chunkSubtitles(
  subtitles: SubtitleLine[],
  maxChunkDuration: number = 3600,
  maxChunkChars: number = 10000
): SubtitleLine[][] {
  if (!subtitles || subtitles.length === 0) {
    return [];
  }

  const chunks: SubtitleLine[][] = [];
  let currentChunk: SubtitleLine[] = [];
  let currentChunkStartTime = subtitles[0].start;
  let currentChunkCharCount = 0;

  for (const line of subtitles) {
    const lineDuration =
      line.duration || (line.end ? line.end - line.start : 0);
    const currentDuration =
      (line.end || line.start + (line.duration || 0)) - currentChunkStartTime;
    const lineCharCount = line.text.length;

    // Check if adding this line would exceed duration or character limits
    if (
      currentDuration + lineDuration > maxChunkDuration ||
      currentChunkCharCount + lineCharCount > maxChunkChars
    ) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentChunkStartTime = line.start;
        currentChunkCharCount = 0;
      }
    }

    currentChunk.push(line);
    currentChunkCharCount += lineCharCount;
  }

  // Add the last chunk if it contains any lines
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Convert subtitle chunks to text format for prompting
 * @param chunks Array of subtitle chunks
 * @returns Array of text strings for each chunk
 */
export function chunksToText(chunks: SubtitleLine[][]): string[] {
  return chunks.map(chunk => {
    return chunk.map(line => line.text).join(' ');
  });
}
