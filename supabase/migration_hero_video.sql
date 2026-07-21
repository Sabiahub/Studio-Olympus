ALTER TABLE studio 
ADD COLUMN IF NOT EXISTS hero_media_type text DEFAULT 'image',
ADD COLUMN IF NOT EXISTS hero_youtube_id text;
