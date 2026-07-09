"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Loader2, Image as ImageIcon, X, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function TeamPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    instagram: '',
    specialties: '',
    active: true,
    display_order: '0',
    photo_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('artists')
      .select('*')
      .eq('is_guest', false)
      .order('display_order', { ascending: true });
    if (data) setArtists(data);
    setLoading(false);
  };

  const openNewModal = () => {
    setFormData({
      name: '', instagram: '', specialties: '', active: true, display_order: '0', photo_url: ''
    });
    setEditingId(null);
    setImageFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const openEditModal = (artist: any) => {
    setFormData({
      name: artist.name || '',
      instagram: artist.instagram || '',
      specialties: artist.specialties?.join(', ') || '',
      active: artist.active,
      display_order: artist.display_order?.toString() || '0',
      photo_url: artist.photo_url || ''
    });
    setEditingId(artist.id);
    setImageFile(null);
    setPreviewUrl(artist.photo_url);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artista?')) return;
    setOpenDropdownId(null);
    
    const artist = artists.find(a => a.id === id);
    if (artist?.photo_url) {
      try {
        const url = new URL(artist.photo_url);
        const pathParts = url.pathname.split('/olympus/');
        if (pathParts.length > 1) {
          await supabase.storage.from('olympus').remove([pathParts[1]]);
        }
      } catch (e) {
        console.error("Failed to parse/delete image URL", e);
      }
    }

    await supabase.from('artists').delete().eq('id', id);
    fetchArtists();
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
        const filePath = `team/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('olympus')
          .upload(filePath, compressedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('olympus')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      const specialtiesArray = formData.specialties
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const payload = {
        name: formData.name,
        instagram: formData.instagram,
        specialties: specialtiesArray,
        active: formData.active,
        display_order: parseInt(formData.display_order, 10) || 0,
        photo_url: finalImageUrl,
        is_guest: false
      };

      if (editingId) {
        await supabase.from('artists').update(payload).eq('id', editingId);
      } else {
        await supabase.from('artists').insert(payload);
      }

      setIsModalOpen(false);
      fetchArtists();
    } catch (error) {
      console.error('Error saving artist:', error);
      alert('Erro ao salvar o artista.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-olympus-gold">Equipe (Residentes)</h1>
        <Button className="gap-2" onClick={openNewModal}>
          <Plus size={18} />
          Novo Artista
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
                <th className="p-4 font-normal">Ordem</th>
                <th className="p-4 font-normal">Artista</th>
                <th className="p-4 font-normal">Instagram</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olympus-gold/5">
              {artists.map((artist) => (
                <tr key={artist.id} className="hover:bg-olympus-white/5 transition-colors group">
                  <td className="p-4 font-mono text-olympus-gold">{artist.display_order}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-olympus-black rounded-full overflow-hidden border border-olympus-gold/20 flex items-center justify-center">
                        {artist.photo_url ? (
                          <img src={artist.photo_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon size={16} className="text-olympus-white/20" />
                        )}
                      </div>
                      <span className="font-medium text-olympus-white">{artist.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-olympus-white/70">{artist.instagram}</td>
                  <td className="p-4">
                    {artist.active ? (
                      <span className="text-xs text-green-400 font-mono uppercase tracking-widest border border-green-500/30 px-2 py-1 rounded-sm">Ativo</span>
                    ) : (
                      <span className="text-xs text-olympus-white/50 font-mono uppercase tracking-widest border border-olympus-white/20 px-2 py-1 rounded-sm">Inativo</span>
                    )}
                  </td>
                  <td className="p-4 text-right relative">
                    <button 
                      onClick={() => setOpenDropdownId(openDropdownId === artist.id ? null : artist.id)}
                      className="text-olympus-white/40 hover:text-olympus-gold p-1 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openDropdownId === artist.id && (
                      <div className="absolute right-4 mt-2 w-32 bg-olympus-graphite border border-olympus-gold/20 shadow-xl rounded-sm z-10 flex flex-col overflow-hidden">
                        <button onClick={() => openEditModal(artist)} className="text-left px-4 py-2 text-sm hover:bg-olympus-gold/10 text-olympus-white">Editar</button>
                        <button onClick={() => handleDelete(artist.id)} className="text-left px-4 py-2 text-sm hover:bg-olympus-wine/20 text-olympus-wine">Excluir</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {artists.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-olympus-white/40">
                    Nenhum artista cadastrado.
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
              <h2 className="font-serif text-2xl text-olympus-gold">{editingId ? 'Editar Artista' : 'Novo Artista'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-olympus-white/40 hover:text-olympus-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 hide-scrollbar">
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                <div>
                  <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Foto de Perfil</label>
                  <div 
                    className="border-2 border-dashed border-olympus-gold/20 rounded-sm h-48 flex flex-col items-center justify-center bg-olympus-black/50 hover:bg-olympus-black cursor-pointer transition-colors relative overflow-hidden w-48 mx-auto rounded-full"
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

                <div>
                  <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Especialidades (separadas por vírgula)</label>
                  <input type="text" placeholder="Ex: Blackwork, Fineline, Realismo" value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="accent-olympus-gold w-4 h-4" />
                      Artista Ativo
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Ordem de Exibição</label>
                    <input type="number" value={formData.display_order} onChange={e => setFormData({...formData, display_order: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold font-mono" />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-olympus-gold/10 bg-olympus-graphite z-10 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-olympus-gold/20 text-olympus-white hover:bg-olympus-white/5">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-olympus-gold text-olympus-black hover:bg-olympus-white flex gap-2">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {editingId ? 'Salvar Alterações' : 'Criar Artista'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
