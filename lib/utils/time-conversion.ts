export function secondsToMinutes(seconds: number): number {
  return Math.floor(seconds / 60);
}

export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

export function formatTimeToMinutes(time: string): number {
  const parts = time.split(':').map(Number);
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 60 + minutes + seconds / 60;
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes + seconds / 60;
  }
  return 0;
}

export function formatTimeToSeconds(time: string): number {
  const parts = time.split(':').map(Number);
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 60 * 60 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  return 0;
}

export function formatSecondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
