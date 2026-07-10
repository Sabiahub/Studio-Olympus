"use client";

import { useEffect, useRef } from 'react';

export default function FeaturedWorksSection({ works }: { works: any[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const layersRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!section1Ref.current || works.length <= 1) return;

    const section1 = section1Ref.current;
    const layerRefs = layersRef.current.filter(Boolean) as HTMLDivElement[];
    
    // We get the initial top position relative to the document
    const rect = section1.getBoundingClientRect();
    const etalonTop = rect.top + window.scrollY;
    const etalonBottom = rect.bottom + window.scrollY;
    const etalonHeight = section1.offsetHeight;

    let currentIndex = 0;
    let currentRef = layerRefs[currentIndex];
    
    if (currentRef) {
      currentRef.style.marginTop = etalonHeight + "px";
    }

    let currentPos = window.scrollY;

    const toggleStickyBehavior = () => {
      let scrollPosition = window.scrollY;
      let isScrollUp = currentPos > scrollPosition;

      function getDownDistance() {
        return (
          etalonBottom * (currentIndex + 1) -
          etalonTop * (currentIndex + 1) +
          etalonTop
        );
      }

      function getUpDistance() {
        return (
          etalonBottom * currentIndex + etalonTop * (currentIndex + 1) - etalonTop
        );
      }

      if (!isScrollUp && scrollPosition >= getDownDistance()) {
        if (currentRef) {
          currentRef.style.marginTop = '0px';

          if (!currentRef.classList.contains("fixed-layer") && currentIndex < layerRefs.length - 1) {
            currentRef.classList.add("fixed-layer");
            currentIndex += 1;
            currentRef = layerRefs[currentIndex];
          }
          if (currentRef) {
            currentRef.style.marginTop = getDownDistance() + "px";
          }
        }
      }

      if (isScrollUp && getUpDistance() > scrollPosition && currentIndex > 0) {
        if (currentRef) {
          currentRef.style.marginTop = '0px';
          currentIndex -= 1;
          currentRef = layerRefs[currentIndex];
          
          if (currentRef && currentRef.classList.contains("fixed-layer")) {
            currentRef.classList.remove("fixed-layer");
          }

          if (currentRef) {
            if (currentIndex < 1) {
              currentRef.style.marginTop = getUpDistance() + etalonBottom - etalonTop + "px";
            } else {
              currentRef.style.marginTop = getUpDistance() + etalonBottom + "px";
            }
          }
        }
      }

      currentPos = window.scrollY;
    };

    window.addEventListener("scroll", toggleStickyBehavior, { passive: true });
    toggleStickyBehavior();

    return () => {
      window.removeEventListener("scroll", toggleStickyBehavior);
    };
  }, [works]);

  if (!works || works.length === 0) return null;

  return (
    <section className="py-20 bg-olympus-black relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 mb-12 relative z-10">
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

      <style jsx>{`
        .scroll-wrapper {
          position: relative;
          width: 100%;
          padding: 24px;
          padding-bottom: calc(20vh - 24px);
        }
        .scroll-section {
          position: relative;
          display: flex;
          justify-content: flex-start;
          align-items: flex-end;
          width: 100%;
          max-width: calc(100vw - 48px);
          margin: 0 auto;
          height: 80vh;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .scroll-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%);
          z-index: 1;
        }
        .scroll-content {
          position: relative;
          z-index: 2;
          padding: 3rem;
          width: 100%;
        }
        .fixed-layer {
          position: fixed;
          top: 24px;
          left: 24px;
          right: 24px;
          width: calc(100% - 48px) !important;
          max-width: none !important;
        }
      `}</style>

      <div className="scroll-wrapper" ref={wrapperRef}>
        {works.map((work, index) => {
          const isFirst = index === 0;
          
          return (
            <div key={work.id} className={isFirst ? "relative z-0" : `relative z-[${index}]`}>
              <section 
                id={`section${index + 1}`} 
                ref={isFirst ? section1Ref : (el) => { layersRef.current[index - 1] = el; }}
                className={`scroll-section ${isFirst ? 'fixed-layer' : 'layer'}`}
              >
                <img 
                  src={work.image_url} 
                  alt={work.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="scroll-content">
                  <h3 className="font-serif text-3xl md:text-5xl text-olympus-gold mb-2">{work.title}</h3>
                  {work.artist?.name && (
                    <p className="text-lg md:text-xl font-sans text-olympus-white/80 uppercase tracking-wider">Por {work.artist.name}</p>
                  )}
                </div>
              </section>
            </div>
          );
        })}
      </div>
    </section>
  );
}
