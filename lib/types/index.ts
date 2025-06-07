// Re-export types from core
export type {
  Highlight,
  HighlightCreate,
  Category,
  SubtitleEntry,
  Translation,
  CategoryTag,
} from './core';

// Re-export types from video
export type {
  VideoMetadata,
  VideoSummary,
  VideoListItem,
  VideoDetail,
  VideoNote,
} from './video';

// Re-export types from other modules
export * from './error';
export * from './search';
export * from './obsidian';
