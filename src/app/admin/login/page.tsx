"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/admin');
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-olympus-black px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-marble.png")' }}></div>
      
      <div className="w-full max-w-md bg-olympus-graphite border border-olympus-gold/20 p-8 rounded-sm relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-olympus-gold mb-2 tracking-widest">OLYMPUS</h1>
          <p className="font-mono text-sm text-olympus-white/50 uppercase tracking-widest">Painel Restrito</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-olympus-wine/20 border border-olympus-wine text-olympus-white/90 text-sm rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-olympus-white/70 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-olympus-black border border-olympus-gold/30 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-olympus-white/70 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-olympus-black border border-olympus-gold/30 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold transition-colors"
            />
          </div>
          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            {loading ? 'Acessando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}

