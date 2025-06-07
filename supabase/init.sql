-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  zh_summary TEXT,
  en_summary TEXT,
  classification TEXT,
  subtitles JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create highlights table
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subtitle', 'summary')),
  color TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id ON videos(youtube_id);
CREATE INDEX IF NOT EXISTS idx_summaries_video_id ON summaries(video_id);
CREATE INDEX IF NOT EXISTS idx_highlights_video_id ON highlights(video_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for videos table
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access to videos
CREATE POLICY "Public read access"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Public insert access"
  ON videos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access"
  ON videos FOR UPDATE
  USING (true);

-- Create RLS policies for summaries
CREATE POLICY "Public read access"
  ON summaries FOR SELECT
  USING (true);

CREATE POLICY "Public insert access"
  ON summaries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access"
  ON summaries FOR UPDATE
  USING (true);

-- Create RLS policies for highlights
CREATE POLICY "Public read access"
  ON highlights FOR SELECT
  USING (true);

CREATE POLICY "Public insert access"
  ON highlights FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access"
  ON highlights FOR UPDATE
  USING (true);
