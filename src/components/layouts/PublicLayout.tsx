import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export default function PublicLayout() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-olympus-green text-olympus-white">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-olympus-green/90 border-b border-olympus-gold/10 backdrop-blur-md py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center relative">
          <a href="#" className="font-serif text-2xl tracking-widest text-olympus-gold z-50 relative">
            OLYMPUS
          </a>
        </div>
      </header>

      {/* Pure CSS Gooey Menu */}
      <input className="menu-icon" type="checkbox" id="menu-icon" name="menu-icon"/>
      <label htmlFor="menu-icon"></label>
      <nav className="nav"> 		
        <ul className="pt-5">
          <li><a href="#about" onClick={() => document.getElementById('menu-icon')?.click()}>O Studio</a></li>
          <li><a href="#tattoos" onClick={() => document.getElementById('menu-icon')?.click()}>Tattoos Disponíveis</a></li>
          <li><a href="#team" onClick={() => document.getElementById('menu-icon')?.click()}>Equipe</a></li>
          <li><a href="#contact" onClick={() => document.getElementById('menu-icon')?.click()}>Contato</a></li>
        </ul>
      </nav>

      <main>
        <Outlet />
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/5531999999999?text=Ol%C3%A1%21+Gostaria+de+agendar+uma+avalia%C3%A7%C3%A3o+no+Studio+Olympus."
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-olympus-gold text-olympus-green rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(203,163,109,0.4)] hover:scale-110 hover:bg-olympus-white hover:shadow-[0_4px_20px_rgba(240,240,237,0.5)] transition-all duration-300"
          aria-label="Contato via WhatsApp"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
        </a>

        {/* Maps Floating Button */}
        <a
          href="https://maps.google.com/?q=Studio+Olympus+-+Tattoo+BH,+Av.+Bar%C3%A3o+Homem+de+Melo,+3647+-+Sl+1301+-+Nova+Granada,+Belo+Horizonte+-+MG,+30494-275"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-olympus-green-light border border-olympus-gold/30 text-olympus-gold rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.4)] hover:scale-110 hover:bg-olympus-gold hover:text-olympus-green hover:border-olympus-gold transition-all duration-300"
          title="Como chegar"
          aria-label="Como chegar no Studio"
        >
          <MapPin size={22} />
        </a>
      </div>

      {/* Footer */}
      <footer id="contact" className="bg-olympus-green border-t border-olympus-gold/20 py-16">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-2xl">
          <h2 className="font-serif text-3xl mb-6 text-olympus-gold">Studio Olympus</h2>
          <p className="text-olympus-white/80 mb-2 font-sans font-light">
            Studio Olympus - Tattoo BH
          </p>
          <p className="text-olympus-white/60 mb-8 font-sans font-light text-sm">
            Av. Barão Homem de Melo, 3647 - Sl 1301 - Nova Granada<br/>
            Belo Horizonte - MG, 30494-275
          </p>
          
          <a 
            href="https://maps.google.com/?q=Studio+Olympus+-+Tattoo+BH,+Av.+Bar%C3%A3o+Homem+de+Melo,+3647+-+Sl+1301+-+Nova+Granada,+Belo+Horizonte+-+MG,+30494-275"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-olympus-gold/50 text-olympus-gold hover:bg-olympus-gold hover:text-olympus-green transition-colors uppercase tracking-widest text-xs font-serif mb-12"
          >
            <MapPin size={16} />
            Como chegar
          </a>

          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-olympus-gold transition-colors">Instagram</a>
            <a href="#" className="hover:text-olympus-gold transition-colors">WhatsApp</a>
          </div>
          <p className="mt-12 text-xs text-olympus-white/40 font-mono">
            © {new Date().getFullYear()} Studio Olympus. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
