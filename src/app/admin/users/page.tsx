"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X } from 'lucide-react';
import { getUsers, changeUserRole, createUser } from './actions';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor' as 'admin' | 'editor'
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    setLoading(true);
    
    // Check session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }

    setCurrentUserId(session.user.id);

    // Check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      router.push('/admin');
      return;
    }

    await loadUsers();
  };

  const loadUsers = async () => {
    const result = await getUsers();
    if (result.success && result.data) {
      setUsers(result.data);
    } else {
      console.error('Failed to load users:', result.error);
    }
    setLoading(false);
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    if (newRole !== 'admin' && newRole !== 'editor') return;
    
    // Prevent changing own role
    if (id === currentUserId) {
      alert("Você não pode alterar seu próprio cargo.");
      return;
    }

    // Optimistic update
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    
    const result = await changeUserRole(id, newRole);
    if (!result.success) {
      alert("Erro ao alterar cargo: " + result.error);
      // Revert if failed
      loadUsers();
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await createUser(
      formData.email,
      formData.name,
      formData.password,
      formData.role
    );

    if (result.success) {
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'editor' });
      await loadUsers();
    } else {
      setErrorMsg(result.error || 'Erro ao criar usuário.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-olympus-gold">Usuários</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-olympus-gold text-olympus-black px-4 py-2 rounded-sm font-mono text-sm uppercase tracking-wider hover:bg-white transition-colors"
        >
          <Plus size={16} />
          <span>Novo Usuário</span>
        </button>
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
                <th className="p-4 font-normal">Data de Criação</th>
                <th className="p-4 font-normal">Papel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olympus-gold/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-olympus-white/5 transition-colors">
                  <td className="p-4 font-medium text-olympus-white">{user.name || '-'}</td>
                  <td className="p-4 text-olympus-white/70">{user.email}</td>
                  <td className="p-4 font-mono text-olympus-white/70">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={user.id === currentUserId}
                      className={`px-2 py-1 text-xs rounded-sm border uppercase tracking-wider font-mono transition-colors focus:outline-none appearance-none ${
                        user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        user.role === 'admin' ? 'border-olympus-gold/30 text-olympus-gold bg-olympus-gold/5' :
                        'border-olympus-white/20 text-olympus-white/50 bg-olympus-black/50'
                      }`}
                    >
                      <option value="editor">Editor</option>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-olympus-graphite border border-olympus-gold/20 rounded-sm w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-olympus-gold/10">
              <h2 className="font-serif text-xl text-olympus-gold">Criar Novo Usuário</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-olympus-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4">
              {errorMsg && (
                <div className="bg-olympus-wine/10 text-olympus-wine border border-olympus-wine/20 p-3 rounded-sm text-sm">
                  {errorMsg}
                </div>
              )}
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-olympus-white/50 uppercase tracking-wider">Nome</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="bg-olympus-black border border-olympus-gold/20 rounded-sm px-3 py-2 text-white focus:outline-none focus:border-olympus-gold/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-olympus-white/50 uppercase tracking-wider">E-mail</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="bg-olympus-black border border-olympus-gold/20 rounded-sm px-3 py-2 text-white focus:outline-none focus:border-olympus-gold/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-olympus-white/50 uppercase tracking-wider">Senha Temporária</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="bg-olympus-black border border-olympus-gold/20 rounded-sm px-3 py-2 text-white focus:outline-none focus:border-olympus-gold/50 transition-colors"
                />
                <span className="text-[10px] text-olympus-white/30">Mínimo de 6 caracteres.</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-olympus-white/50 uppercase tracking-wider">Papel Inicial</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as 'admin' | 'editor'})}
                  className="bg-olympus-black border border-olympus-gold/20 rounded-sm px-3 py-2 text-white focus:outline-none focus:border-olympus-gold/50 transition-colors appearance-none cursor-pointer"
                >
                  <option value="editor">Editor (Restrito)</option>
                  <option value="admin">Administrador (Total)</option>
                </select>
              </div>

              <div className="mt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-olympus-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm uppercase tracking-wider font-mono rounded-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-olympus-gold text-olympus-black py-2 hover:bg-white transition-colors text-sm uppercase tracking-wider font-mono rounded-sm flex justify-center items-center"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
