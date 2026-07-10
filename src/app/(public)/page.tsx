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
    supabase.from('artists').select('*').eq('active', true).order('display_order'),
    supabase.from('tattoos').select('*, artists(name)').order('created_at', { ascending: false }),
    supabase.from('featured_works').select('*, artists(name)').order('display_order'),
    supabase.from('studio').select('*').single(),
    supabase
      .from('artists')
      .select('*')
      .eq('is_guest', true)
      .eq('active', true)
      .lte('guest_start', today)
      .or(`guest_end.is.null,guest_end.gte.${today}`)
  ]);

  if (!tattoosData || tattoosData.length === 0) {
    console.warn("[Home] Nenhuma tatuagem encontrada no Supabase — verifique se o seed foi executado e se as env vars de produção apontam para o projeto correto.");
  }
  if (!artistsData || artistsData.length === 0) {
    console.warn("[Home] Nenhum artista encontrado no Supabase.");
  }

  const artists = artistsData || [];
  // Filter out tattooed status here or in component, instruction says "Em TattoosSection, filtre para não exibir tatuagens com status = 'tattooed'". I'll do it before passing to TattoosSection or inside TattoosSection. Let's do it here. Wait, instruction says "Em TattoosSection, filtre...", I'll filter it in TattoosSection.
  const tattoos = tattoosData || [];
  const featuredWorks = featuredWorksData || [];
  const studio = studioData || { whatsapp: '5531999999999' };
  const activeGuest = guestData && guestData.length > 0 ? guestData[0] : null;

  return (
    <div>
      <HeroSection studio={studio} />
      <AboutSection studio={studio} />
      <FeaturedWorksSection works={featuredWorks} />
      <TattoosSection tattoos={tattoos} whatsapp={studio.whatsapp} />
      <TeamSection team={artists} />
      {activeGuest && <GuestSection guest={activeGuest} whatsapp={studio.whatsapp} />}
    </div>
  );
}
