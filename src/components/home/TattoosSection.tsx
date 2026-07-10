"use client";
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function TattoosSection({ tattoos, whatsapp }: { tattoos: any[], whatsapp: string }) {
  const [selectedStyle, setSelectedStyle] = useState('Todos');
  const [selectedArtist, setSelectedArtist] = useState('Todos os tatuadores');

  const styles = useMemo(() => {
    const s = new Set(tattoos.map(t => t.category).filter(Boolean));
    return ['Todos', ...Array.from(s)];
  }, [tattoos]);

  const artists = useMemo(() => {
    const a = new Set(tattoos.map(t => t.artist?.name).filter(Boolean));
    return ['Todos os tatuadores', ...Array.from(a)];
  }, [tattoos]);

  const filteredTattoos = tattoos.filter(t => {
    if (t.status === 'tattooed') return false;
    const matchStyle = selectedStyle === 'Todos' || t.category === selectedStyle;
    const matchArtist = selectedArtist === 'Todos os tatuadores' || t.artist?.name === selectedArtist;
    return matchStyle && matchArtist;
  });

  const handleWhatsAppClick = async (tattooId: string, tattooCode: string) => {
    try {
      await supabase.rpc('increment_tattoo_click', { tattoo_id: tattooId });
    } catch (e) {
      console.error(e);
    }
    const msg = `Olá! Vi no site a tattoo ${tattooCode} e gostaria de agendar uma avaliação.`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <section id="tattoos" className="py-24 bg-olympus-green-light relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl mb-4 tracking-widest uppercase">Tattoos Disponíveis</h2>
          <div className="w-16 h-[1px] bg-olympus-gold mx-auto"></div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-row justify-center gap-4 mb-10 w-full max-w-md mx-auto">
          <div className="flex-1 flex flex-col">
            <label className="text-[10px] md:text-xs font-mono text-olympus-gold mb-1 uppercase tracking-widest px-1">Estilo</label>
            <div className="relative">
              <select 
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full appearance-none bg-olympus-green-light border border-olympus-gold/30 rounded-sm px-3 py-2 md:py-2.5 text-[11px] md:text-sm text-olympus-white focus:outline-none focus:border-olympus-gold transition-colors cursor-pointer"
              >
                {styles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-olympus-gold">
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <label className="text-[10px] md:text-xs font-mono text-olympus-gold mb-1 uppercase tracking-widest px-1">Tatuador</label>
            <div className="relative">
              <select 
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                className="w-full appearance-none bg-olympus-green-light border border-olympus-gold/30 rounded-sm px-3 py-2 md:py-2.5 text-[11px] md:text-sm text-olympus-white focus:outline-none focus:border-olympus-gold transition-colors cursor-pointer"
              >
                {artists.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-olympus-gold">
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
          {filteredTattoos.map((tattoo) => (
            <motion.div 
              key={tattoo.id}
              whileHover={{ y: -5 }}
              className={`group bg-olympus-black border border-olympus-gold/10 hover:border-olympus-gold/40 transition-all duration-300 relative overflow-hidden flex flex-col ${tattoo.status === 'reserved' ? 'opacity-70 grayscale-[30%]' : ''}`}
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <img src={tattoo.image_url} alt={tattoo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-olympus-black/80 backdrop-blur-sm px-2 py-0.5 md:px-3 md:py-1 font-mono text-[10px] md:text-xs border border-olympus-gold/30 text-olympus-gold">
                  {tattoo.code}
                </div>
                <div className="absolute top-2 right-2 md:top-4 md:right-4 flex flex-col gap-1 md:gap-2 items-end">
                  {tattoo.status === 'reserved' && (
                    <div className="bg-olympus-gold/90 px-2 py-0.5 md:px-3 md:py-1 font-sans text-[10px] md:text-xs uppercase tracking-wider text-olympus-black font-semibold shadow-sm">
                      Reservada
                    </div>
                  )}
                  {tattoo.is_promotion && (
                    <div className="bg-olympus-wine px-2 py-0.5 md:px-3 md:py-1 font-sans text-[10px] md:text-xs uppercase tracking-wider text-white shadow-sm">
                      Promo
                    </div>
                  )}
                </div>
              </div>
              <div className="p-3 md:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] md:text-sm text-olympus-white/50 mb-1 md:mb-2 font-mono uppercase truncate">{tattoo.artist?.name || 'Desconhecido'}</p>
                  <h3 className="font-serif text-sm md:text-xl mb-2 md:mb-4 truncate">{tattoo.title}</h3>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-2">
                    <div className="flex items-center">
                      {tattoo.is_promotion && tattoo.original_price ? (
                         <>
                           <span className="text-[10px] md:text-sm text-olympus-white/40 line-through mr-2">R$ {tattoo.original_price}</span>
                           <span className="font-sans font-medium text-olympus-gold text-sm md:text-lg">R$ {tattoo.price}</span>
                         </>
                      ) : (
                        <span className="font-sans font-medium text-olympus-gold text-sm md:text-lg">R$ {tattoo.price}</span>
                      )}
                    </div>
                    {tattoo.category && (
                      <span className="text-[9px] md:text-xs text-olympus-white/60 bg-olympus-graphite px-1.5 py-0.5 md:px-2 md:py-1 rounded-sm w-fit truncate">{tattoo.category}</span>
                    )}
                  </div>
                </div>
                <Button 
                  className="w-full font-serif uppercase tracking-wider text-[10px] md:text-sm py-1 md:py-2 h-auto md:h-10"
                  onClick={() => handleWhatsAppClick(tattoo.id, tattoo.code)}
                >
                  Tenho Interesse
                </Button>
              </div>
            </motion.div>
          ))}
          {filteredTattoos.length === 0 && (
            <div className="col-span-full text-center py-12 text-olympus-white/60">
              Nenhuma arte encontrada para os filtros selecionados.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
