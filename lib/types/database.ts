import { SubtitleEntry } from './video';

export interface Note {
  id: string;
  video_id: string;
  content: string;
  timestamp: number | null;
  created_at: string;
  updated_at: string;
}

export interface VideoNote extends Omit<Note, 'timestamp'> {
  timestamp: number | null;
  type: 'note';
  tags: string[];
}
export interface Highlight {
  id: string;
  video_id: string;
  content: string;
  start_offset: number;
  end_offset: number;
  type: 'subtitle' | 'summary';
  color: string;
  created_at: string;
  updated_at: string;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Summary {
  id: string;
  video_id: string;
  user_id: string;
  en_summary: string;
  zh_summary: string;
  subtitles: SubtitleEntry[];
  classification: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      video_notes: {
        Row: Note;
        Insert: Omit<Note, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>;
      };
      highlights: {
        Row: Highlight;
        Insert: Omit<Highlight, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Highlight, 'id' | 'created_at' | 'updated_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      summaries: {
        Row: Summary;
        Insert: Omit<Summary, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Summary, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
