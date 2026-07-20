-- portfolio_images
CREATE TABLE portfolio_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS Setup
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read portfolio_images" ON portfolio_images FOR SELECT USING (true);

-- Editor/Admin write access
CREATE POLICY "Editors can insert portfolio_images" ON portfolio_images FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Editors can update portfolio_images" ON portfolio_images FOR UPDATE USING (true) WITH CHECK (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Editors can delete portfolio_images" ON portfolio_images FOR DELETE USING (public.get_user_role() IN ('admin', 'editor'));
