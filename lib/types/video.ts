import { Highlight as DBHighlight } from './database';
import { HighlightCreate } from './core';

export interface VideoMetadata {
  duration?: number;
  width?: number;
  height?: number;
  notes?: string;
}

export interface VideoSummary {
  subtitles?: SubtitleEntry[];
  highlights?: any[];
  classification?: string;
  translation?: string;
  zh_summary?: string;
  en_summary?: string;
}

export interface VideoListItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  youtube_id: string;
  thumbnail_url: string;
  category_ids?: string[];
  notes_count?: number;
  highlights_count?: number;
  created_at: string;
  updated_at: string;
  metadata?: VideoMetadata; // Added metadata field here
  status?: 'pending' | 'processing' | 'completed';
  published_at?: string;
}

export interface VideoDetail extends VideoListItem {
  summary?: VideoSummary;
}

export interface VideoNote {
  id: string;
  video_id: string;
  content: string;
  type: 'note' | 'highlight' | 'summary' | 'takeaway';
  timestamp: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SubtitleEntry {
  start: number;
  duration: number;
  text: string;
}

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  isFullscreen: boolean;
}

export interface PlayerControls {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
}

export type VideoEventCallback = (state: VideoState) => void;

export type SortableFields =
  | 'created_at'
  | 'updated_at'
  | 'title'
  | 'notes_count'
  | 'highlights_count';

export type NoteType = 'note' | 'highlight' | 'summary' | 'takeaway';

export interface UIHighlight extends Omit<DBHighlight, 'text'> {
  note?: string;
  content: string;
  color: string;
}
