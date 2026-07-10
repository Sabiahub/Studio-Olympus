"use client";

export default function FeaturedWorksSection({ works }: { works: any[] }) {
  if (!works || works.length === 0) return null;

  return (
    <section className="py-20 bg-olympus-black relative">
      <div className="container mx-auto px-4 md:px-8 mb-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl mb-4 tracking-widest uppercase text-olympus-gold">Grandes Trabalhos</h2>
            <div className="w-16 h-[1px] bg-olympus-gold"></div>
          </div>
          <p className="font-sans text-sm text-olympus-white/60 max-w-md font-light">
            Projetos exclusivos desenvolvidos sob medida.
          </p>
        </div>
      </div>

      <style jsx>{`
        .scroll-wrapper {
          position: relative;
          width: 100%;
          padding: 24px;
          /* The extra padding-bottom allows the last card to be scrolled past properly */
          padding-bottom: 24px; 
          display: flex;
          flex-direction: column;
          gap: 30vh; /* Creates the scroll distance between cards (reduced for faster scroll) */
        }
        .scroll-section {
          position: sticky;
          top: 16vh; /* Offset from the top of the viewport when it sticks */
          display: flex;
          justify-content: flex-start;
          align-items: flex-end;
          width: 100%;
          max-width: calc(100vw - 48px);
          margin: 0 auto;
          height: 65vh; /* Reduced height from 80vh to 65vh */
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
      `}</style>

      {/* 
        Using position: sticky creates the exact same layered stacking effect 
        without the Javascript bugs of position: fixed leaking into other sections. 
      */}
      <div className="scroll-wrapper pb-[20vh]">
        {works.map((work, index) => {
          return (
            <section 
              key={work.id}
              className="scroll-section"
              style={{ zIndex: index }}
            >
              <img 
                src={work.image_url} 
                alt="Featured work" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Overlay shadow to create depth between stacked layers */}
              <div className="absolute inset-0 bg-black/20" />
            </section>
          );
        })}
      </div>
    </section>
  );
}
