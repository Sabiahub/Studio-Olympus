import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Users, UserSquare2, Image as ImageIcon, Settings, LogOut, Loader2, UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/supabase';

export default function AdminLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-olympus-graphite flex items-center justify-center">
        <Loader2 className="animate-spin text-olympus-gold" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const isAdmin = profile?.role === 'admin';

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Tatuagens', path: '/admin/tattoos', icon: ImageIcon },
    { name: 'Equipe', path: '/admin/team', icon: Users },
    { name: 'Guests', path: '/admin/guests', icon: UserSquare2 },
    { name: 'Grandes Trabalhos', path: '/admin/featured', icon: ImageIcon },
    { name: 'Configurações', path: '/admin/settings', icon: Settings },
    ...(isAdmin ? [{ name: 'Usuários', path: '/admin/users', icon: UsersRound }] : []),
  ];

  return (
    <div className="min-h-screen bg-olympus-black text-olympus-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-olympus-graphite border-r border-olympus-gold/10 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-olympus-gold/10">
          <span className="font-serif text-xl tracking-widest text-olympus-gold">OLYMPUS</span>
          <span className="ml-2 text-xs font-mono text-olympus-white/40 uppercase">Panel</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-sans text-sm",
                  isActive 
                    ? "bg-olympus-gold/10 text-olympus-gold" 
                    : "text-olympus-white/70 hover:text-olympus-white hover:bg-olympus-white/5"
                )}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-olympus-gold/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-olympus-black border border-olympus-gold/30 flex items-center justify-center text-xs font-serif text-olympus-gold">
              {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{profile?.name || 'Usuário'}</span>
              <span className="text-xs text-olympus-white/50 capitalize">{profile?.role || 'editor'}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-sans text-sm text-olympus-wine hover:bg-olympus-wine/10"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-olympus-black">
        <Outlet context={{ user, profile }} />
      </main>
    </div>
  );
}
