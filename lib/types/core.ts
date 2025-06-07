export interface Highlight {
  id: string;
  video_id: string;
  start_offset: number;
  end_offset: number;
  content: string;
  type: 'summary' | 'subtitle';
  created_at: string;
  updated_at: string;
  note?: string;
  color: string;
}

export interface HighlightCreate {
  video_id: string;
  start_offset: number;
  end_offset: number;
  content: string;
  type: 'summary' | 'subtitle';
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface SubtitleEntry {
  start: number;
  duration: number;
  text: string;
}

export interface Translation {
  text: string;
  language: string;
}

export interface CategoryTag {
  id: string;
  name: string;
  color: string;
}
