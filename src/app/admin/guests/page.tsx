"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Loader2, Image as ImageIcon, X, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { format, parseISO } from 'date-fns';

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    instagram: '',
    bio: '',
    active: true,
    photo_url: '',
    guest_start: '',
    guest_end: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('artists')
      .select('*')
      .eq('is_guest', true)
      .order('guest_start', { ascending: false });
    if (data) setGuests(data);
    setLoading(false);
  };

  const openNewModal = () => {
    setFormData({
      name: '', instagram: '', bio: '', active: true, photo_url: '', guest_start: '', guest_end: ''
    });
    setEditingId(null);
    setImageFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const openEditModal = (guest: any) => {
    setFormData({
      name: guest.name || '',
      instagram: guest.instagram || '',
      bio: guest.bio || '',
      active: guest.active,
      photo_url: guest.photo_url || '',
      guest_start: guest.guest_start || '',
      guest_end: guest.guest_end || ''
    });
    setEditingId(guest.id);
    setImageFile(null);
    setPreviewUrl(guest.photo_url);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este guest?')) return;
    setOpenDropdownId(null);
    
    const guest = guests.find(g => g.id === id);
    if (guest?.photo_url) {
      try {
        const url = new URL(guest.photo_url);
        const pathParts = url.pathname.split('/olympus/');
        if (pathParts.length > 1) {
          await supabase.storage.from('olympus').remove([pathParts[1]]);
        }
      } catch (e) {
        console.error("Failed to parse/delete image URL", e);
      }
    }

    const { data, error } = await supabase.from('artists').delete().eq('id', id).select();
    if (error || !data || data.length === 0) {
      alert(`Não foi possível excluir: ${error?.message || 'Permissão negada.'}`);
      return;
    }
    fetchGuests();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.photo_url;

      if (imageFile) {
        const compressedFile = await imageCompression(imageFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        });

        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `guests/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('olympus')
          .upload(filePath, compressedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('olympus')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      const payload = {
        name: formData.name,
        instagram: formData.instagram,
        bio: formData.bio,
        active: formData.active,
        photo_url: finalImageUrl,
        guest_start: formData.guest_start || null,
        guest_end: formData.guest_end || null,
        is_guest: true
      };

      if (editingId) {
        const { data, error } = await supabase.from('artists').update(payload).eq('id', editingId).select();
        if (error || !data || data.length === 0) {
          throw new Error(error?.message || 'Permissão negada ou guest não encontrado.');
        }
      } else {
        const { error } = await supabase.from('artists').insert(payload);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchGuests();
    } catch (error) {
      console.error('Error saving guest:', error);
      alert('Erro ao salvar o guest.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-olympus-gold">Guests</h1>
        <Button className="gap-2" onClick={openNewModal}>
          <Plus size={18} />
          Novo Guest
        </Button>
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
                <th className="p-4 font-normal">Guest</th>
                <th className="p-4 font-normal">Período</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olympus-gold/5">
              {guests.map((guest, index) => {
                const formattedStart = guest.guest_start ? format(parseISO(guest.guest_start), "dd/MM/yyyy") : '';
                const formattedEnd = guest.guest_end ? format(parseISO(guest.guest_end), "dd/MM/yyyy") : '';
                
                return (
                <tr key={guest.id} className="hover:bg-olympus-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-olympus-black rounded-full overflow-hidden border border-olympus-gold/20 flex items-center justify-center">
                        {guest.photo_url ? (
                          <img src={guest.photo_url} className="w-full h-full object-cover grayscale" alt="" />
                        ) : (
                          <ImageIcon size={16} className="text-olympus-white/20" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-olympus-white">{guest.name}</span>
                        <span className="text-xs text-olympus-white/50">{guest.instagram}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-olympus-gold">
                    {formattedStart} {formattedStart && formattedEnd && ' - '} {formattedEnd}
                  </td>
                  <td className="p-4">
                    {(() => {
                      let statusText = 'Inativo';
                      let statusColorClass = 'text-olympus-white/50 border-olympus-white/20';
                      
                      if (guest.active) {
                        const todayStr = new Date().toISOString().split('T')[0];
                        if (guest.guest_start && guest.guest_start > todayStr) {
                          statusText = 'Agendado';
                          statusColorClass = 'text-amber-400 border-amber-500/30';
                        } else if (guest.guest_end && guest.guest_end < todayStr) {
                          statusText = 'Encerrado';
                          statusColorClass = 'text-gray-400 border-gray-500/30';
                        } else {
                          statusText = 'Ativo';
                          statusColorClass = 'text-green-400 border-green-500/30';
                        }
                      }
                      
                      return (
                        <span className={`text-xs font-mono uppercase tracking-widest border px-2 py-1 rounded-sm ${statusColorClass}`}>
                          {statusText}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-4 text-right relative">
                    <button 
                      onClick={() => setOpenDropdownId(openDropdownId === guest.id ? null : guest.id)}
                      className="text-olympus-white/40 hover:text-olympus-gold p-1 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openDropdownId === guest.id && (
                      <div className={`absolute right-4 w-32 bg-olympus-graphite border border-olympus-gold/20 shadow-xl rounded-sm z-50 flex flex-col overflow-hidden ${index >= guests.length - 2 && guests.length > 3 ? 'bottom-10 mb-2' : 'top-10 mt-2'}`}>
                        <button onClick={() => openEditModal(guest)} className="text-left px-4 py-2 text-sm hover:bg-olympus-gold/10 text-olympus-white">Editar</button>
                        <button onClick={() => handleDelete(guest.id)} className="text-left px-4 py-2 text-sm hover:bg-olympus-wine/20 text-olympus-wine">Excluir</button>
                      </div>
                    )}
                  </td>
                </tr>
              )})}
              {guests.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-olympus-white/40">
                    Nenhum guest cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-olympus-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-olympus-graphite border border-olympus-gold/20 rounded-sm w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-olympus-gold/10 flex justify-between items-center bg-olympus-graphite z-10">
              <h2 className="font-serif text-2xl text-olympus-gold">{editingId ? 'Editar Guest' : 'Novo Guest'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-olympus-white/40 hover:text-olympus-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 hide-scrollbar">
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                <div>
                  <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Foto de Perfil</label>
                  <div 
                    className="border-2 border-dashed border-olympus-gold/20 rounded-sm h-48 flex flex-col items-center justify-center bg-olympus-black/50 hover:bg-olympus-black cursor-pointer transition-colors relative overflow-hidden w-48 mx-auto"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-olympus-white/40">
                        <Upload size={24} className="mb-2" />
                        <span className="text-[10px] font-sans">Enviar Foto</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Nome</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Instagram</label>
                    <input type="text" placeholder="@usuario" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Data Início</label>
                    <input type="date" value={formData.guest_start} onChange={e => setFormData({...formData, guest_start: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Data Fim</label>
                    <input type="date" value={formData.guest_end} onChange={e => setFormData({...formData, guest_end: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Biografia Curta</label>
                  <textarea rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="accent-olympus-gold w-4 h-4" />
                    Guest Ativo
                  </label>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-olympus-gold/10 bg-olympus-graphite z-10 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-olympus-gold/20 text-olympus-white hover:bg-olympus-white/5">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-olympus-gold text-olympus-black hover:bg-olympus-white flex gap-2">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {editingId ? 'Salvar Alterações' : 'Criar Guest'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
