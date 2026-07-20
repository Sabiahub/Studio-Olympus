"use client";
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export default function GuestSection({ guests, whatsapp }: { guests: any[], whatsapp: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedGuest = guests.find((g) => g.id === selectedId);

  useEffect(() => {
    if (selectedId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedId]);

  if (!guests || guests.length === 0) return null;

  return (
    <section className="py-24 bg-olympus-green-light relative border-y border-olympus-gold/10 overflow-hidden flex flex-col items-center text-center">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-marble.png")' }}></div>
      
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        <h2 className="font-serif text-5xl md:text-7xl text-olympus-gold mb-12 uppercase tracking-widest drop-shadow-md">
          {guests.length > 1 ? 'Guests' : 'Guest'}
        </h2>
        
        <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch w-full max-w-6xl">
          {guests.map((guest, index) => {
            const handleWhatsAppClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              const msg = `Olá! Gostaria de agendar com o(a) guest ${guest.name}.`;
              window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
            };

            const formattedStart = guest.guest_start ? format(parseISO(guest.guest_start), "d MMM", { locale: ptBR }) : '';
            const formattedEnd = guest.guest_end ? format(parseISO(guest.guest_end), "d MMM", { locale: ptBR }) : '';
            const seasonText = formattedStart && formattedEnd ? `${formattedStart} - ${formattedEnd}` : 'Em breve';

            return (
              <motion.div 
                layoutId={`guest-card-${guest.id}`}
                key={guest.id || index} 
                onClick={() => setSelectedId(guest.id)}
                className="flex flex-col items-center flex-1 cursor-pointer group"
              >
                <div className="w-64 md:w-80 lg:w-96 mb-2 relative mx-auto">
                   {guest.photo_url && (
                     <div className="w-full aspect-[3/4] rounded-3xl border border-olympus-gold/30 overflow-hidden relative shadow-2xl shadow-black group-hover:border-olympus-gold/60 transition-colors duration-500">
                       <div className="w-full h-full group-hover:scale-105 transition-transform duration-700">
                         <motion.img 
                           layoutId={`guest-image-${guest.id}`}
                           src={guest.photo_url} 
                           alt={guest.name} 
                           className="w-full h-full object-cover object-top transition-[filter] duration-700" 
                           style={{filter: 'grayscale(1) sepia(0.5) hue-rotate(5deg) contrast(1.2)'}} 
                         />
                       </div>
                     </div>
                   )}
                </div>
                
                <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 p-8 border border-olympus-gold/20 w-full max-w-lg bg-olympus-green/90 backdrop-blur-sm shadow-xl shadow-olympus-black/50 flex-1 flex flex-col group-hover:border-olympus-gold/40 transition-colors duration-500"
                >
                  <motion.h4 
                    layoutId={`guest-title-${guest.id}`}
                    className="font-serif text-2xl md:text-3xl text-olympus-white mb-2"
                  >
                    {guest.name}
                  </motion.h4>
                  <p className="font-mono text-[10px] md:text-xs text-olympus-gold mb-6 uppercase tracking-widest">Temporada: {seasonText}</p>
                  <motion.p 
                    layoutId={`guest-bio-${guest.id}`}
                    className="font-sans text-sm md:text-base text-olympus-white/80 leading-relaxed mb-8 font-light flex-1"
                  >
                    {guest.bio}
                  </motion.p>
                  <div className="relative z-10 w-full mt-auto">
                    <Button 
                      size="lg" 
                      className="w-full font-serif tracking-widest uppercase bg-transparent border border-olympus-gold text-olympus-gold hover:bg-olympus-gold hover:text-olympus-green transition-all duration-300"
                      onClick={handleWhatsAppClick}
                    >
                      Agendar com {guest.name.split(' ')[0]}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Expanded Modal View */}
      <AnimatePresence>
        {selectedId && selectedGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              layoutId={`guest-card-${selectedId}`}
              className="w-full max-w-5xl bg-olympus-green rounded-3xl overflow-hidden shadow-2xl relative flex flex-col my-auto max-h-[90vh] border border-olympus-gold/30 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-6 right-6 z-20 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-olympus-gold transition-colors border border-olympus-gold/30"
                onClick={() => setSelectedId(null)}
              >
                <X size={24} />
              </button>

              <div className="relative h-64 md:h-96 w-full shrink-0 flex flex-col">
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <motion.img
                    layoutId={`guest-image-${selectedId}`}
                    src={selectedGuest.photo_url}
                    alt={selectedGuest.name}
                    className="w-full h-full object-cover object-top transition-[filter] duration-700"
                    style={{filter: 'grayscale(0.3) sepia(0.2) hue-rotate(5deg) contrast(1.1)'}} 
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute inset-0 bg-gradient-to-t from-olympus-green via-olympus-green/60 to-transparent flex flex-col justify-end p-8"
                >
                  <motion.h2
                    layoutId={`guest-title-${selectedId}`}
                    className="text-4xl md:text-5xl font-serif text-olympus-gold mb-2"
                  >
                    {selectedGuest.name}
                  </motion.h2>
                  
                  {selectedGuest.instagram && (
                    <motion.a
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      href={selectedGuest.instagram.startsWith('http') ? selectedGuest.instagram : `https://www.instagram.com/${selectedGuest.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg text-white hover:text-olympus-gold transition-colors w-fit mb-4 relative z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {selectedGuest.instagram.startsWith('@') ? selectedGuest.instagram : `@${selectedGuest.instagram}`}
                    </motion.a>
                  )}

                  <motion.p
                    layoutId={`guest-bio-${selectedId}`}
                    className="text-white/90 max-w-2xl line-clamp-3 font-light"
                  >
                    {selectedGuest.bio}
                  </motion.p>
                </motion.div>
              </div>

              {/* Portfolio Gallery */}
              <div className="p-8 overflow-y-auto bg-olympus-green-light flex-1">
                <h3 className="text-2xl font-serif text-olympus-gold mb-6 tracking-widest uppercase">Portfólio</h3>
                
                {(!selectedGuest.portfolio_images || selectedGuest.portfolio_images.length === 0) ? (
                  <div className="flex items-center justify-center py-12 text-white/50 italic font-light">
                    Portfólio em breve...
                  </div>
                ) : (
                  <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                    {[...selectedGuest.portfolio_images]
                      .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                      .map((img: any, index: number) => (
                      <motion.div
                        key={img.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        className="break-inside-avoid rounded-xl overflow-hidden border border-olympus-gold/10 hover:border-olympus-gold/30 transition-colors md:aspect-[4/5]"
                      >
                        <img
                          src={img.image_url}
                          alt={`${selectedGuest.name} portfolio ${index + 1}`}
                          className="w-full object-cover hover:scale-105 transition-transform duration-500 h-auto md:h-full"
                          loading="lazy"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
