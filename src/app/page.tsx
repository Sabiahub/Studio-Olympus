import { supabase } from '@/lib/supabase';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import FeaturedWorksSection from '@/components/home/FeaturedWorksSection';
import TattoosSection from '@/components/home/TattoosSection';
import GuestSection from '@/components/home/GuestSection';
import TeamSection from '@/components/home/TeamSection';

export const revalidate = 60; // ISR every 60 seconds

export default async function HomePage() {
  const teamNames = [
    "Bruxa", "Caio", "Fera", "Glass", "Jottas", "João", "Leon", "Luan", 
    "Lusca", "Manu", "Marcella", "Marcellus", "Maria", "Passati", "Ruana", "Rubi"
  ];

  const staticTeam = teamNames.map((name, index) => ({
    id: String(index + 1),
    name,
    photo_url: `/photos/WEB.Equipe/${name}.webp`,
    specialties: ['Tattoo Art'],
    instagram: `@${name.toLowerCase()}`
  }));

  const tattooFiles = [
    "17.webp", "18.webp", "19.webp", "20.webp", "21.webp", "22.webp", "23.webp", 
    "24.webp", "25.webp", "26.webp", "27.webp", "28.webp", "29.webp", "30.webp"
  ];
  const categories = ['Realismo', 'Blackwork', 'Fineline', 'Old School'];

  const staticTattoos = tattooFiles.map((file, index) => ({
    id: String(index + 1),
    title: `Flash Art ${index + 1}`,
    code: `T${index + 100}`,
    price: 450 + (index * 50),
    original_price: index % 3 === 0 ? 700 + (index * 50) : null,
    is_promotion: index % 3 === 0,
    image_url: `/photos/WEB.Tattoo/${file}`,
    category: categories[index % categories.length],
    artist: { name: teamNames[index % teamNames.length] }
  }));

  const staticStudio = {
    whatsapp: '5531999999999'
  };

  return (
    <div>
      <HeroSection studio={staticStudio} />
      <AboutSection studio={staticStudio} />
      <FeaturedWorksSection works={[]} />
      <TattoosSection tattoos={staticTattoos} whatsapp={staticStudio.whatsapp} />
      <TeamSection team={staticTeam} />
    </div>
  );
}
