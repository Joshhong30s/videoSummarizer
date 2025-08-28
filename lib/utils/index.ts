import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}

// Re-export utility functions
export * from './cn';
export * from './format-time';
export * from './highlight-colors';
export * from './highlight-text';
export * from './subtitle-chunking';
export * from './url-validation';
export * from './youtube';

// Re-export time conversion functions with explicit naming
export {
  secondsToMinutes,
  formatTimeToMinutes,
  formatTimeToSeconds,
  formatSecondsToTime,
} from './time-conversion';
