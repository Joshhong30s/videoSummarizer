-- Add published_at column to videos table
ALTER TABLE videos ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to have created_at as published_at (temporary fix)
UPDATE videos SET published_at = created_at WHERE published_at IS NULL;
