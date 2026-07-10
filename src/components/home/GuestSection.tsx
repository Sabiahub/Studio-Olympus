"use client";
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GuestSection({ guest, whatsapp }: { guest: any, whatsapp: string }) {
  const handleWhatsAppClick = () => {
    const msg = `Olá! Gostaria de agendar com o(a) guest ${guest.name}.`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const formattedStart = guest.guest_start ? format(parseISO(guest.guest_start), "d MMM", { locale: ptBR }) : '';
  const formattedEnd = guest.guest_end ? format(parseISO(guest.guest_end), "d MMM", { locale: ptBR }) : '';
  const seasonText = formattedStart && formattedEnd ? `${formattedStart} - ${formattedEnd}` : 'Em breve';

  return (
    <section className="py-24 bg-olympus-green-light relative border-y border-olympus-gold/10 overflow-hidden flex flex-col items-center text-center">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-marble.png")' }}></div>
      
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        <h2 className="font-serif text-5xl md:text-7xl text-olympus-gold mb-2 uppercase tracking-widest drop-shadow-md">Guest</h2>
        
        <div className="w-64 md:w-80 lg:w-96 mb-2 relative mx-auto">
           {guest.photo_url && (
             <div className="w-full aspect-[3/4] rounded-t-[120px] md:rounded-t-[180px] border border-olympus-gold/30 overflow-hidden relative shadow-2xl shadow-black">
               <img 
                 src={guest.photo_url} 
                 alt={guest.name} 
                 className="w-full h-full object-cover" 
                 style={{filter: 'grayscale(1) sepia(0.5) hue-rotate(5deg) contrast(1.2)'}} 
               />
             </div>
           )}
        </div>
        
        <div className="mt-2 p-8 border border-olympus-gold/20 max-w-lg bg-olympus-green/90 backdrop-blur-sm shadow-xl shadow-olympus-black/50">
          <h4 className="font-serif text-2xl md:text-3xl text-olympus-white mb-2">{guest.name}</h4>
          <p className="font-mono text-[10px] md:text-xs text-olympus-gold mb-6 uppercase tracking-widest">Temporada: {seasonText}</p>
          <p className="font-sans text-sm md:text-base text-olympus-white/80 leading-relaxed mb-8 font-light">
            {guest.bio}
          </p>
          <Button 
            size="lg" 
            className="w-full font-serif tracking-widest uppercase bg-transparent border border-olympus-gold text-olympus-gold hover:bg-olympus-gold hover:text-olympus-green transition-all duration-300"
            onClick={handleWhatsAppClick}
          >
            Agendar com {guest.name.split(' ')[0]}
          </Button>
        </div>
      </div>
    </section>
  );
}
