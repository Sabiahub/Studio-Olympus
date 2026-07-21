"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export default function TeamSection({ team }: { team: any[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPortfolioImage, setSelectedPortfolioImage] = useState<string | null>(null);

  const selectedArtist = team.find((a) => a.id === selectedId);

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

  if (!team || team.length === 0) return null;

  return (
    <section id="team" className="py-24 relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl mb-4 tracking-widest uppercase">Equipe Olympus</h2>
          <div className="w-16 h-[1px] bg-olympus-gold mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {team.map((artist) => (
            <motion.div 
              key={artist.id} 
              onClick={() => setSelectedId(artist.id)}
              className="relative group rounded-3xl overflow-hidden bg-olympus-green-light border border-olympus-gold/10 hover:border-olympus-gold/40 transition-colors transition-shadow duration-500 shadow-lg hover:shadow-2xl cursor-pointer"
            >
              <div className="aspect-[3/4] w-full bg-black/20 overflow-hidden">
                <div className="w-full h-full md:group-hover:scale-105 transition-transform duration-700">
                  <motion.img 
                    layoutId={`team-image-${artist.id}`}
                    src={artist.photo_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400"} 
                    alt={artist.name} 
                    className="w-full h-full object-cover object-top grayscale-0 md:grayscale md:group-hover:grayscale-0 transition-[filter] duration-700" 
                  />
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 left-4 right-4 bg-olympus-green-light/95 backdrop-blur-md border border-olympus-gold/20 py-3 px-4 rounded-2xl text-center transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 shadow-xl"
              >
                <motion.h3 
                  layoutId={`team-title-${artist.id}`}
                  className="font-serif text-lg md:text-xl text-olympus-gold mb-0.5"
                >
                  {artist.name}
                </motion.h3>
                {artist.instagram && (
                  <a 
                    href={artist.instagram.startsWith('http') ? artist.instagram : `https://www.instagram.com/${artist.instagram.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title={artist.instagram}
                    className="text-xs md:text-sm text-white/80 hover:text-olympus-gold transition-colors block truncate w-full relative z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {artist.instagram.startsWith('@') ? artist.instagram : `@${artist.instagram}`}
                  </a>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Expanded Modal View */}
      <AnimatePresence>
        {selectedId && selectedArtist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/95 md:bg-black/90 md:backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl bg-olympus-green rounded-3xl overflow-hidden shadow-2xl relative flex flex-col my-auto h-[90dvh] md:h-auto md:max-h-[90vh] border border-olympus-gold/20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-6 right-6 z-20 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-olympus-gold transition-colors border border-olympus-gold/30"
                onClick={() => setSelectedId(null)}
              >
                <X size={24} />
              </button>

              <div className="relative h-64 md:h-96 w-full shrink-0">
                <motion.img
                  layoutId={`team-image-${selectedId}`}
                  src={selectedArtist.photo_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400"}
                  alt={selectedArtist.name}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute inset-0 bg-gradient-to-t from-olympus-green via-olympus-green/40 to-transparent flex flex-col justify-end p-8"
                >
                  <motion.h2
                    layoutId={`team-title-${selectedId}`}
                    className="text-4xl md:text-5xl font-serif text-olympus-gold mb-2"
                  >
                    {selectedArtist.name}
                  </motion.h2>
                  {selectedArtist.instagram && (
                    <motion.a
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      href={selectedArtist.instagram.startsWith('http') ? selectedArtist.instagram : `https://www.instagram.com/${selectedArtist.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg text-white hover:text-olympus-gold transition-colors w-fit relative z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {selectedArtist.instagram.startsWith('@') ? selectedArtist.instagram : `@${selectedArtist.instagram}`}
                    </motion.a>
                  )}
                  {selectedArtist.bio && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/80 mt-4 max-w-2xl line-clamp-3"
                    >
                      {selectedArtist.bio}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Portfolio Gallery */}
              <div className="p-8 overflow-y-auto bg-olympus-green-light flex-1">
                <h3 className="text-2xl font-serif text-olympus-gold mb-6 tracking-widest uppercase">Portfólio</h3>
                
                {selectedArtist.portfolio_images && selectedArtist.portfolio_images.length > 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
                    >
                      {[...selectedArtist.portfolio_images]
                        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                        .map((img: any, index: number) => (
                        <motion.div
                          key={img.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.4 }}
                          className="break-inside-avoid rounded-xl overflow-hidden border border-olympus-gold/10 hover:border-olympus-gold/30 transition-colors aspect-[4/5] cursor-pointer"
                          onClick={() => setSelectedPortfolioImage(img.image_url)}
                        >
                          <img
                            src={img.image_url}
                            alt={`${selectedArtist.name} portfolio ${index + 1}`}
                            className="w-full object-cover hover:scale-105 transition-transform duration-500 h-full"
                            loading="lazy"
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-olympus-white/50">
                      <p className="font-serif text-xl mb-2 text-olympus-gold">Portfólio em breve</p>
                      <p className="text-sm">Mais trabalhos serão adicionados em breve.</p>
                    </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Fullscreen Portfolio Image Modal */}
      <AnimatePresence>
        {selectedPortfolioImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedPortfolioImage(null)}
          >
            <button
              className="absolute top-6 right-6 z-20 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-olympus-gold transition-colors border border-olympus-gold/30"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPortfolioImage(null);
              }}
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={selectedPortfolioImage}
              alt="Arte expandida"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
