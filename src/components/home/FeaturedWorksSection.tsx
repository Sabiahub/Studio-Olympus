export default function FeaturedWorksSection({ works }: { works: any[] }) {
  if (!works || works.length === 0) return null;

  return (
    <section className="py-20 relative bg-olympus-black">
      <div className="container mx-auto px-4 md:px-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl mb-4 tracking-widest uppercase text-olympus-gold">Grandes Trabalhos</h2>
            <div className="w-16 h-[1px] bg-olympus-gold"></div>
          </div>
          <p className="font-sans text-sm text-olympus-white/60 max-w-md font-light">
            Projetos exclusivos e de grande escala, desenvolvidos sob medida por nossos artistas residentes.
          </p>
        </div>
      </div>
      
      {/* Horizontal Slider */}
      <div className="w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8">
        <div className="flex gap-6 px-4 md:px-8 w-max">
          {works.map((work) => (
            <div key={work.id} className="w-[90vw] md:w-[600px] lg:w-[800px] shrink-0 snap-center group relative border border-olympus-gold/10">
              <div className="aspect-square md:aspect-[16/9] overflow-hidden">
                <img src={work.image_url} alt={work.title || "Featured work"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-olympus-black via-olympus-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="font-serif text-2xl md:text-3xl text-olympus-gold mb-2">{work.title}</h3>
                {work.artist?.name && (
                  <p className="text-sm md:text-base font-sans text-olympus-white/80 uppercase tracking-wider">Por {work.artist.name}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
