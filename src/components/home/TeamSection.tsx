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
            <div key={artist.id} className="text-center group bg-olympus-green-light border border-olympus-gold/10 p-4 md:p-6 hover:border-olympus-gold/40 transition-colors">
              <div className="w-20 h-20 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden mb-4 md:mb-6 border-2 border-olympus-gold/20 group-hover:border-olympus-gold transition-colors">
                <img src={artist.photo_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400"} alt={artist.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              </div>
              <h3 className="font-serif text-base md:text-xl text-olympus-gold mb-1">{artist.name}</h3>
              {artist.specialties && artist.specialties.length > 0 && (
                <p className="text-[9px] md:text-sm font-sans text-olympus-white/60 mb-2 uppercase tracking-wide truncate">
                  {artist.specialties.join(', ')}
                </p>
              )}
              {artist.instagram && (
                <a href={`https://instagram.com/${artist.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-[10px] md:text-xs text-olympus-gold/70 hover:text-olympus-gold underline underline-offset-4">
                  {artist.instagram.startsWith('@') ? artist.instagram : `@${artist.instagram}`}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
