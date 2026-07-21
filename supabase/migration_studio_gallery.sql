CREATE TABLE studio_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE studio_gallery ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Public read access for studio_gallery" ON studio_gallery FOR SELECT USING (true);
CREATE POLICY "Authenticated insert access for studio_gallery" ON studio_gallery FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update access for studio_gallery" ON studio_gallery FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete access for studio_gallery" ON studio_gallery FOR DELETE USING (auth.role() = 'authenticated');
