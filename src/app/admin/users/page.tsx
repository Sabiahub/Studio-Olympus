"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    // Only super_admin/admin should ideally be able to change roles, but we just implement UI for now
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    await supabase.from('users').update({ role: newRole }).eq('id', id);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-olympus-gold">Usuários</h1>
      </div>

      <div className="bg-olympus-graphite border border-olympus-gold/10 rounded-sm overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-olympus-gold" size={24} />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-olympus-black/50 text-olympus-white/60 font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-normal">Nome</th>
                <th className="p-4 font-normal">Email</th>
                <th className="p-4 font-normal">Telefone</th>
                <th className="p-4 font-normal">Nível de Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olympus-gold/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-olympus-white/5 transition-colors">
                  <td className="p-4 font-medium text-olympus-white">{user.full_name || '-'}</td>
                  <td className="p-4 text-olympus-white/70">{user.email}</td>
                  <td className="p-4 font-mono text-olympus-white/70">{user.phone || '-'}</td>
                  <td className="p-4">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`px-2 py-1 text-xs rounded-sm border uppercase tracking-wider font-mono transition-colors focus:outline-none appearance-none cursor-pointer ${
                        user.role === 'admin' ? 'border-olympus-gold/30 text-olympus-gold bg-olympus-gold/5' :
                        user.role === 'artist' ? 'border-olympus-wine/30 text-olympus-wine bg-olympus-wine/5' :
                        'border-olympus-white/20 text-olympus-white/50 bg-olympus-black/50'
                      }`}
                    >
                      <option value="client">Cliente</option>
                      <option value="artist">Artista</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-olympus-white/40">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
