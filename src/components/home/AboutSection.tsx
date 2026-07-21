export default function AboutSection({ studio, gallery }: { studio: any, gallery?: any[] }) {
  // ATENÇÃO: NÃO REMOVA AS IMAGENS DA PASTA public/photos/WEB.Studio/!
  // Elas são usadas como fallback de segurança caso a galeria do banco de dados (studio_gallery) esteja vazia.
  // Isso garante que o site nunca fique quebrado se o admin excluir todas as fotos.
  const fallbackImages = [
    "/photos/WEB.Studio/31.webp", "/photos/WEB.Studio/32.webp", "/photos/WEB.Studio/33.webp", 
    "/photos/WEB.Studio/34.webp", "/photos/WEB.Studio/35.webp", "/photos/WEB.Studio/36.webp", 
    "/photos/WEB.Studio/37.webp", "/photos/WEB.Studio/38.webp", "/photos/WEB.Studio/39.webp", 
    "/photos/WEB.Studio/40.webp", "/photos/WEB.Studio/41.webp"
  ];

  const imagesToDisplay = gallery && gallery.length > 0 
    ? gallery.map(img => img.image_url) 
    : fallbackImages;

  return (
    <section id="about" className="py-8 md:py-16 relative bg-olympus-green">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-marble.png")' }}></div>
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2 overflow-hidden relative">
            <div className="relative w-full h-48 md:h-64 rounded-sm flex">
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee {
                  0% { transform: translateX(0%); }
                  100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                  display: flex;
                  width: fit-content;
                  animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                  animation-play-state: paused;
                }
              `}} />
              <div className="animate-marquee">
                {/* Dobramos o array de imagens para criar o loop contínuo perfeito */}
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex">
                    {imagesToDisplay.map((img, idx) => (
                      <img key={idx} src={img} alt={`Studio Olympus Interior ${idx + 1}`} className="w-64 md:w-80 h-48 md:h-64 object-cover shrink-0 mr-4 rounded-sm border border-olympus-gold/20" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center mt-3 text-xs text-olympus-white/40 font-mono uppercase tracking-widest">Nossos espaços</p>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="font-serif text-2xl md:text-4xl text-olympus-gold mb-4 uppercase tracking-wider">A Arte Encontra a Eternidade</h2>
            <p className="font-sans text-sm md:text-base text-olympus-white/80 leading-relaxed mb-4 font-light">
              Artistas que transformam técnica, identidade e precisão em tatuagens que marcam histórias.
            </p>
            
          </div>
        </div>
      </div>
    </section>
  );
}
