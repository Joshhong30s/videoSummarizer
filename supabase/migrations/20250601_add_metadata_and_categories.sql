-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add metadata column to videos table
ALTER TABLE videos 
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN category_ids UUID[] DEFAULT '{}';

-- Add foreign key constraint
ALTER TABLE videos
ADD CONSTRAINT fk_video_categories
FOREIGN KEY (category_ids) REFERENCES categories(id);

-- Create index for faster category filtering
CREATE INDEX idx_videos_category_ids ON videos USING GIN (category_ids);
CREATE INDEX idx_videos_metadata ON videos USING GIN (metadata);

-- Add some default categories
INSERT INTO categories (name, color) VALUES
('mcp', '#2563eb'),
('web', '#db2777'),
('ai tool', '#16a34a'),
('docker', '#ea580c'),
('others', '#7c3aed');
