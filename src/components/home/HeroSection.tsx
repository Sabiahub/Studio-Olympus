"use client";
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function HeroSection({ studio }: { studio: any }) {
  const bgImage = studio?.hero_image || "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=2000";
  const isVideo = studio?.hero_media_type === 'video' && !!studio?.hero_youtube_id;
  const videoId = studio?.hero_youtube_id;

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-olympus-green">
      {/* Background Layer */}
      {isVideo ? (
        <div className="absolute inset-0 overflow-hidden opacity-30 mix-blend-luminosity pointer-events-none">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
            allow="autoplay; encrypted-media"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] max-w-none pointer-events-none"
            title="Hero Video Background"
          ></iframe>
        </div>
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: `url('${bgImage}')` }}
        ></div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-olympus-green/60 via-olympus-green/40 to-olympus-black pointer-events-none"></div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-widest text-olympus-white mb-6 uppercase">
            {studio?.title || 'Olympus'}
          </h1>
          <div className="w-24 h-[1px] bg-olympus-gold mx-auto mb-8"></div>
          <p className="font-sans text-xl md:text-2xl text-olympus-white/80 font-light mb-12">
            {studio?.description || 'O Melhor Estúdio de Tatuagem de Belo Horizonte'}
          </p>
          <Button 
            size="lg" 
            className="font-serif tracking-widest uppercase bg-olympus-gold text-olympus-black hover:bg-olympus-white"
            onClick={() => document.getElementById('tattoos')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Quero tatuar
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
