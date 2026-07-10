"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, Settings, Users, Image as ImageIcon, Star, StarHalf } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (!session && !pathname?.includes('/login')) {
        router.push('/admin/login');
      } else if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setRole(profile.role);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (!session && !pathname?.includes('/login')) {
        router.push('/admin/login');
      } else if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setRole(profile.role);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  useEffect(() => {
    if (role === 'editor' && pathname === '/admin/users') {
      router.push('/admin');
    }
  }, [role, pathname, router]);

  if (!session) {
    // If not on login page and no session, we return null while redirecting
    if (!pathname?.includes('/login')) return null;
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-olympus-black text-olympus-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-olympus-graphite border-r border-olympus-gold/20 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-olympus-gold/10">
          <h2 className="font-serif text-2xl text-olympus-gold tracking-widest">OLYMPUS</h2>
          <p className="text-xs font-mono text-olympus-white/50 mt-1 uppercase">Painel de Controle</p>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${pathname === '/admin' ? 'bg-olympus-gold/10 text-olympus-gold border border-olympus-gold/20' : 'text-olympus-white/70 hover:bg-olympus-gold/5 hover:text-olympus-gold'}`}>
            <StarHalf size={18} />
            <span className="font-sans text-sm uppercase tracking-wider">Dashboard</span>
          </Link>
          <Link href="/admin/tattoos" className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${pathname === '/admin/tattoos' ? 'bg-olympus-gold/10 text-olympus-gold border border-olympus-gold/20' : 'text-olympus-white/70 hover:bg-olympus-gold/5 hover:text-olympus-gold'}`}>
            <ImageIcon size={18} />
            <span className="font-sans text-sm uppercase tracking-wider">Tattoos</span>
          </Link>
          <Link href="/admin/featured" className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${pathname === '/admin/featured' ? 'bg-olympus-gold/10 text-olympus-gold border border-olympus-gold/20' : 'text-olympus-white/70 hover:bg-olympus-gold/5 hover:text-olympus-gold'}`}>
            <Star size={18} />
            <span className="font-sans text-sm uppercase tracking-wider">Destaques</span>
          </Link>
          <Link href="/admin/team" className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${pathname === '/admin/team' ? 'bg-olympus-gold/10 text-olympus-gold border border-olympus-gold/20' : 'text-olympus-white/70 hover:bg-olympus-gold/5 hover:text-olympus-gold'}`}>
            <Users size={18} />
            <span className="font-sans text-sm uppercase tracking-wider">Equipe</span>
          </Link>
          <Link href="/admin/guests" className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${pathname === '/admin/guests' ? 'bg-olympus-gold/10 text-olympus-gold border border-olympus-gold/20' : 'text-olympus-white/70 hover:bg-olympus-gold/5 hover:text-olympus-gold'}`}>
            <User size={18} />
            <span className="font-sans text-sm uppercase tracking-wider">Guests</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-olympus-gold/10 flex flex-col gap-2">
          {role === 'admin' && (
            <Link href="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${pathname === '/admin/users' ? 'bg-olympus-gold/10 text-olympus-gold border border-olympus-gold/20' : 'text-olympus-white/70 hover:bg-olympus-gold/5 hover:text-olympus-gold'}`}>
              <Users size={18} />
              <span className="font-sans text-sm uppercase tracking-wider">Usuários</span>
            </Link>
          )}
          <Link href="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${pathname === '/admin/settings' ? 'bg-olympus-gold/10 text-olympus-gold border border-olympus-gold/20' : 'text-olympus-white/70 hover:bg-olympus-gold/5 hover:text-olympus-gold'}`}>
            <Settings size={18} />
            <span className="font-sans text-sm uppercase tracking-wider">Configurações</span>
          </Link>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-3 px-4 py-3 rounded-sm text-olympus-wine/80 hover:bg-olympus-wine/10 hover:text-olympus-wine transition-colors w-full text-left"
          >
            <LogOut size={18} />
            <span className="font-sans text-sm uppercase tracking-wider">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

