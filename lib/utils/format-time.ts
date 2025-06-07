/**
 * Format time in seconds into HH:MM:SS or MM:SS format
 * @example
 * formatTime(125) // "2:05"
 * formatTime(3661) // "1:01:01"
 */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Format duration in seconds into HH:MM:SS or MM:SS format
 * Alias for formatTime for consistency
 */
export const formatDuration = formatTime;

/**
 * Format minutes into seconds
 * @example
 * minutesToSeconds(1.5) // 90
 */
export function minutesToSeconds(minutes: number): number {
  return Math.floor(minutes * 60);
}

/**
 * Format timestamp (seconds) into MM:SS format
 * @example
 * formatTimestamp(125) // "2:05"
 */
export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Parse time string (HH:MM:SS or MM:SS) into seconds
 * @example
 * parseTime("1:01:01") // 3661
 * parseTime("2:05") // 125
 */
export function parseTime(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}
