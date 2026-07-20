import { supabase } from '@/lib/supabase';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import FeaturedWorksSection from '@/components/home/FeaturedWorksSection';
import TattoosSection from '@/components/home/TattoosSection';
import GuestSection from '@/components/home/GuestSection';
import TeamSection from '@/components/home/TeamSection';

export const revalidate = 60; // ISR every 60 seconds

export default async function HomePage() {
  const today = new Date().toISOString().split('T')[0];

  const [
    { data: artistsData },
    { data: tattoosData },
    { data: featuredWorksData },
    { data: studioData },
    { data: guestData }
  ] = await Promise.all([
    supabase.from('artists').select('*, portfolio_images(*)').eq('active', true).eq('is_guest', false).order('display_order'),
    supabase.from('tattoos').select('*, artists(name)').order('created_at', { ascending: false }),
    supabase.from('featured_works').select('*, artists(name)').order('display_order'),
    supabase.from('studio').select('*').single(),
    supabase
      .from('artists')
      .select('*, portfolio_images(*)')
      .eq('is_guest', true)
      .eq('active', true)
      .lte('guest_start', today)
      .or(`guest_end.is.null,guest_end.gte.${today}`)
      .order('created_at', { ascending: true })
  ]);

  if (!tattoosData || tattoosData.length === 0) {
    console.warn("[Home] Nenhuma tatuagem encontrada no Supabase — verifique se o seed foi executado e se as env vars de produção apontam para o projeto correto.");
  }
  if (!artistsData || artistsData.length === 0) {
    console.warn("[Home] Nenhum artista encontrado no Supabase.");
  }

  const artists = artistsData || [];
  const tattoos = tattoosData || [];
  const featuredWorks = featuredWorksData || [];
  const studio = studioData || { whatsapp: '5531982873734' };
  const activeGuests = guestData && guestData.length > 0 ? guestData : [];

  return (
    <div>
      <HeroSection studio={studio} />
      <AboutSection studio={studio} />
      <FeaturedWorksSection works={featuredWorks} />
      <TattoosSection tattoos={tattoos} whatsapp={studio.whatsapp} />
      {activeGuests.length > 0 && <GuestSection guests={activeGuests} whatsapp={studio.whatsapp} />}
      <TeamSection team={artists} />
    </div>
  );
}
