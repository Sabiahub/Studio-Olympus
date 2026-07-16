-- artists
CREATE TABLE artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_url text,
  bio text,
  specialties text[],
  instagram text,
  is_guest boolean DEFAULT false,
  guest_start date,
  guest_end date NULL,
  active boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- tattoos
CREATE TABLE tattoos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  artist_id uuid REFERENCES artists(id),
  category text,
  price numeric,
  original_price numeric NULL,
  is_promotion boolean DEFAULT false,
  status text CHECK (status in ('available','reserved','tattooed')) DEFAULT 'available',
  click_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- featured_works
CREATE TABLE featured_works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  artist_id uuid REFERENCES artists(id),
  title text,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- studio
CREATE TABLE studio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Studio Olympus',
  description text,
  address text,
  whatsapp text,
  instagram text,
  hero_image text,
  about_image text,
  logo_url text
);

-- profiles (linked to auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role in ('admin','editor')) NOT NULL DEFAULT 'editor',
  name text,
  created_at timestamptz DEFAULT now()
);

-- RLS Setup
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tattoos ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Public read tattoos" ON tattoos FOR SELECT USING (true);
CREATE POLICY "Public read featured_works" ON featured_works FOR SELECT USING (true);
CREATE POLICY "Public read studio" ON studio FOR SELECT USING (true);

-- Editor/Admin write access (assuming auth.uid() is in profiles table with appropriate role)
-- For simplicity, checking if a profile exists is a basic check. You can make this more robust.

-- Helper function to check role
CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Artists policies
CREATE POLICY "Editors can insert artists" ON artists FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Editors can update artists" ON artists FOR UPDATE USING (true) WITH CHECK (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Editors can delete artists" ON artists FOR DELETE USING (public.get_user_role() IN ('admin', 'editor'));

-- Tattoos policies
CREATE POLICY "Editors can insert tattoos" ON tattoos FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Editors can update tattoos" ON tattoos FOR UPDATE USING (true) WITH CHECK (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Editors can delete tattoos" ON tattoos FOR DELETE USING (public.get_user_role() IN ('admin', 'editor'));
-- Allow public to increment click_count (update only click_count if needed, or via RPC function)
-- It's safer to use an RPC function for incrementing click_count to avoid public updates.

-- Featured works policies
CREATE POLICY "Editors can insert featured_works" ON featured_works FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Editors can update featured_works" ON featured_works FOR UPDATE USING (true) WITH CHECK (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Editors can delete featured_works" ON featured_works FOR DELETE USING (public.get_user_role() IN ('admin', 'editor'));

-- Studio policies
CREATE POLICY "Editors can update studio" ON studio FOR UPDATE USING (true) WITH CHECK (public.get_user_role() IN ('admin', 'editor'));
-- Initialize studio row
INSERT INTO studio (id, title) VALUES (gen_random_uuid(), 'Studio Olympus');

-- Profiles policies
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (public.get_user_role() = 'admin' OR id = auth.uid());
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (true) WITH CHECK (public.get_user_role() = 'admin');
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

-- RPC for incrementing click_count securely
CREATE OR REPLACE FUNCTION increment_tattoo_click(tattoo_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.tattoos
  SET click_count = click_count + 1
  WHERE id = tattoo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up storage
INSERT INTO storage.buckets (id, name, public) VALUES ('olympus', 'olympus', true);
CREATE POLICY "Public read images" ON storage.objects FOR SELECT USING (bucket_id = 'olympus');
CREATE POLICY "Editors can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'olympus' AND public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Editors can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'olympus') WITH CHECK (bucket_id = 'olympus' AND public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Editors can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'olympus' AND public.get_user_role() IN ('admin', 'editor'));
