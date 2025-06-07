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
  { label: '全部', value: 'all' },
  { label: '影片', value: 'video' },
  { label: '摘要', value: 'summary' },
  { label: '字幕', value: 'subtitle' },
  { label: '重點', value: 'highlight' },
  { label: '筆記', value: 'takeaway' },
];

export const ALL_CONTENT_TYPES: ContentType[] = [
  'video',
  'summary',
  'subtitle',
  'highlight',
  'takeaway',
];
