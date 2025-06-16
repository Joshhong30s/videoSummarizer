export type ContentType =
  | 'all'
  | 'video'
  | 'subtitle'
  | 'summary'
  | 'highlight'
  | 'takeaway';

export interface SearchResult {
  video_id: string;
  video_title: string;
  youtube_id: string;
  thumbnail_url: string;
  content_type: ContentType;
  timestamp?: number;
  content: string;
  rank?: number;
}

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

export interface SearchFilters {
  query: string;
  types: ContentType[];
  categoryIds: string[];
  dateRange: string;
  sort: SortOption;
}

export interface SearchParams extends SearchFilters {
  page: number;
  limit: number;
}

export const CONTENT_TYPE_OPTIONS: Array<{
  label: string;
  value: ContentType;
}> = [
  { label: 'All', value: 'all' },
  { label: 'Video', value: 'video' },
  { label: 'Summary', value: 'summary' },
  { label: 'Subtitle', value: 'subtitle' },
  { label: 'Highlight', value: 'highlight' },
  { label: 'Note', value: 'takeaway' },
];

export const ALL_CONTENT_TYPES: ContentType[] = [
  'video',
  'summary',
  'subtitle',
  'highlight',
  'takeaway',
];
