export type Artist = {
  id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  specialties: string[] | null;
  instagram: string | null;
  is_guest: boolean;
  guest_start: string | null;
  guest_end: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
};

export type Tattoo = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  image_url: string;
  artist_id: string | null;
  category: string | null;
  price: number | null;
  original_price: number | null;
  is_promotion: boolean;
  status: 'available' | 'reserved' | 'tattooed';
  click_count: number;
  created_at: string;
};

export type FeaturedWork = {
  id: string;
  image_url: string;
  artist_id: string | null;
  title: string | null;
  display_order: number;
  created_at: string;
};

export type Studio = {
  id: string;
  title: string;
  description: string | null;
  address: string | null;
  whatsapp: string | null;
  instagram: string | null;
  hero_image: string | null;
  about_image: string | null;
  logo_url: string | null;
};

export type Profile = {
  id: string;
  role: 'admin' | 'editor';
  name: string | null;
  created_at: string;
};
