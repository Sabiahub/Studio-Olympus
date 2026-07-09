"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Palette, UserCheck, UserPlus, TrendingUp } from 'lucide-react';
import Link from "next/link";;

export default function DashboardPage() {
  const [stats, setStats] = useState({
    tattoosAvailable: 0,
    tattoosReserved: 0,
    artistsActive: 0,
    guestsActive: 0,
  });
  
  const [topTattoos, setTopTattoos] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // These queries would ideally be done via a custom RPC or Promise.all for real-world scenarios.
    
    // Tattoos
    const { count: countAvail } = await supabase.from('tattoos').select('*', { count: 'exact', head: true }).eq('status', 'available');
    const { count: countRes } = await supabase.from('tattoos').select('*', { count: 'exact', head: true }).eq('status', 'reserved');
    
    // Artists
    const { count: countActive } = await supabase.from('artists').select('*', { count: 'exact', head: true }).eq('active', true).eq('is_guest', false);
    
    // Guests (active today)
    const today = new Date().toISOString().split('T')[0];
    const { count: countGuest } = await supabase.from('artists')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
      .eq('is_guest', true)
      .lte('guest_start', today)
      .or(`guest_end.is.null,guest_end.gte.${today}`);

    setStats({
      tattoosAvailable: countAvail || 0,
      tattoosReserved: countRes || 0,
      artistsActive: countActive || 0,
      guestsActive: countGuest || 0,
    });

    // Top Tattoos
    const { data: top } = await supabase.from('tattoos').select('id, code, title, click_count, image_url').order('click_count', { ascending: false }).limit(5);
    if (top) setTopTattoos(top);
  };

  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl text-olympus-gold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Tattoos Disponíveis" value={stats.tattoosAvailable} icon={Palette} />
        <StatCard title="Em Negociação" value={stats.tattoosReserved} icon={TrendingUp} />
        <StatCard title="Tatuadores Residentes" value={stats.artistsActive} icon={UserCheck} />
        <StatCard title="Guests Ativos Hoje" value={stats.guestsActive} icon={UserPlus} />
      </div>

      <div className="bg-olympus-graphite border border-olympus-gold/10 rounded-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl">Tattoos Mais Desejadas</h2>
          <Link href="/admin/tattoos" className="text-sm text-olympus-gold hover:underline">Ver todas</Link>
        </div>
        
        {topTattoos.length > 0 ? (
          <div className="space-y-4">
            {topTattoos.map((tattoo) => (
              <div key={tattoo.id} className="flex items-center justify-between p-4 bg-olympus-black/50 border border-olympus-gold/5 rounded-sm hover:border-olympus-gold/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm overflow-hidden bg-olympus-graphite">
                    {tattoo.image_url ? (
                      <img src={tattoo.image_url} alt={tattoo.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-olympus-white/20"><Palette size={20}/></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-olympus-white">{tattoo.code} - {tattoo.title}</h3>
                    <p className="text-sm text-olympus-white/50">Clique em "Tenho interesse"</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl text-olympus-gold">{tattoo.click_count}</div>
                  <div className="text-xs text-olympus-white/40 uppercase tracking-widest">Cliques</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-olympus-white/40">
            Nenhum dado disponível ainda.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string, value: number, icon: any }) {
  return (
    <div className="bg-olympus-graphite border border-olympus-gold/10 rounded-sm p-6 flex items-start justify-between">
      <div>
        <p className="text-sm text-olympus-white/60 mb-2 font-mono uppercase">{title}</p>
        <p className="text-4xl font-serif text-olympus-white">{value}</p>
      </div>
      <div className="p-3 bg-olympus-black/50 rounded-sm text-olympus-gold">
        <Icon size={24} />
      </div>
    </div>
  );
}

