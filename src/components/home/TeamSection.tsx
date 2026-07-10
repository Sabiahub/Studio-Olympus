export default function TeamSection({ team }: { team: any[] }) {
  if (!team || team.length === 0) return null;

  return (
    <section id="team" className="py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl mb-4 tracking-widest uppercase">Equipe Olympus</h2>
          <div className="w-16 h-[1px] bg-olympus-gold mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {team.map((artist) => (
            <div key={artist.id} className="relative group rounded-3xl overflow-hidden bg-olympus-green-light border border-olympus-gold/10 hover:border-olympus-gold/40 transition-all duration-500 shadow-lg hover:shadow-2xl">
              <div className="aspect-[3/4] w-full bg-black/20">
                <img src={artist.photo_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400"} alt={artist.name} className="w-full h-full object-cover object-top grayscale-0 md:grayscale md:group-hover:grayscale-0 md:group-hover:scale-105 transition-all duration-700" />
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-olympus-green-light/95 backdrop-blur-md border border-olympus-gold/20 py-3 px-4 rounded-2xl text-center transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 shadow-xl">
                <h3 className="font-serif text-lg md:text-xl text-olympus-gold mb-0.5">{artist.name}</h3>
                {artist.instagram && (
                  <a href="https://www.instagram.com/studioolympus_/" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-white/80 hover:text-olympus-gold transition-colors inline-flex items-center justify-center">
                    {artist.instagram.startsWith('@') ? artist.instagram : `@${artist.instagram}`}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
