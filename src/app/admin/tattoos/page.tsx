"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, Search, MoreHorizontal, Loader2, Image as ImageIcon, X, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function TattoosPage() {
  const [tattoos, setTattoos] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    price: '',
    original_price: '',
    is_promotion: false,
    category: '',
    artist_id: '',
    status: 'available',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTattoos();
    fetchArtists();
  }, []);

  const fetchTattoos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tattoos')
      .select('*, artists(name)')
      .order('created_at', { ascending: false });
    if (data) setTattoos(data);
    setLoading(false);
  };

  const fetchArtists = async () => {
    const { data } = await supabase
      .from('artists')
      .select('id, name')
      .order('name');
    if (data) setArtists(data);
  };

  const cycleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = 
      currentStatus === 'available' ? 'reserved' :
      currentStatus === 'reserved' ? 'tattooed' : 'available';
      
    setTattoos(tattoos.map(t => t.id === id ? { ...t, status: nextStatus } : t));
    await supabase.from('tattoos').update({ status: nextStatus }).eq('id', id);
  };

  const openNewModal = () => {
    setFormData({
      title: '', code: '', description: '', price: '', original_price: '',
      is_promotion: false, category: '', artist_id: '', status: 'available', image_url: ''
    });
    setEditingId(null);
    setImageFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const openEditModal = (tattoo: any) => {
    setFormData({
      title: tattoo.title || '',
      code: tattoo.code || '',
      description: tattoo.description || '',
      price: tattoo.price?.toString() || '',
      original_price: tattoo.original_price?.toString() || '',
      is_promotion: tattoo.is_promotion || false,
      category: tattoo.category || '',
      artist_id: tattoo.artist_id || '',
      status: tattoo.status || 'available',
      image_url: tattoo.image_url || ''
    });
    setEditingId(tattoo.id);
    setImageFile(null);
    setPreviewUrl(tattoo.image_url);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta arte?')) return;
    setOpenDropdownId(null);
    
    const tattoo = tattoos.find(t => t.id === id);
    if (tattoo?.image_url) {
      try {
        const url = new URL(tattoo.image_url);
        const pathParts = url.pathname.split('/olympus/');
        if (pathParts.length > 1) {
          await supabase.storage.from('olympus').remove([pathParts[1]]);
        }
      } catch (e) {
        console.error("Failed to parse/delete image URL", e);
      }
    }

    await supabase.from('tattoos').delete().eq('id', id);
    fetchTattoos();
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
      let finalImageUrl = formData.image_url;

      if (imageFile) {
        const compressedFile = await imageCompression(imageFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        });

        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `tattoos/${fileName}`;

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
        ...formData,
        price: parseFloat(formData.price) || 0,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        artist_id: formData.artist_id || null,
        image_url: finalImageUrl
      };

      if (editingId) {
        await supabase.from('tattoos').update(payload).eq('id', editingId);
      } else {
        await supabase.from('tattoos').insert(payload);
      }

      setIsModalOpen(false);
      fetchTattoos();
    } catch (error) {
      console.error('Error saving tattoo:', error);
      alert('Erro ao salvar a arte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTattoos = tattoos.filter(t => 
    (t.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (t.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-olympus-gold">Tatuagens</h1>
        <Button className="gap-2" onClick={openNewModal}>
          <Plus size={18} />
          Nova Arte
        </Button>
      </div>

      <div className="bg-olympus-graphite border border-olympus-gold/10 rounded-sm overflow-hidden min-h-[500px]">
        <div className="p-4 border-b border-olympus-gold/10 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-olympus-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por código ou título..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-olympus-gold transition-colors text-olympus-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-olympus-gold" size={24} />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-olympus-black/50 text-olympus-white/60 font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-normal">Arte</th>
                <th className="p-4 font-normal">Código</th>
                <th className="p-4 font-normal">Artista</th>
                <th className="p-4 font-normal">Preço</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olympus-gold/5">
              {filteredTattoos.map((tattoo, index) => (
                <tr key={tattoo.id} className="hover:bg-olympus-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-olympus-black rounded-sm overflow-hidden border border-olympus-gold/20 flex items-center justify-center">
                        {tattoo.image_url ? (
                          <img src={tattoo.image_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon size={16} className="text-olympus-white/20" />
                        )}
                      </div>
                      <span className="font-medium text-olympus-white truncate max-w-[200px]">{tattoo.title}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-olympus-gold">{tattoo.code}</td>
                  <td className="p-4 text-olympus-white/70">{tattoo.artists?.name || 'N/A'}</td>
                  <td className="p-4 font-mono">
                    R$ {tattoo.price}
                    {tattoo.is_promotion && <span className="ml-2 text-[10px] bg-olympus-wine text-white px-1 py-0.5 rounded-sm uppercase">Promo</span>}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => cycleStatus(tattoo.id, tattoo.status)}
                      className={`px-2 py-1 text-xs rounded-sm border uppercase tracking-wider font-mono transition-colors ${
                        tattoo.status === 'available' ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' :
                        tattoo.status === 'reserved' ? 'border-olympus-gold/30 text-olympus-gold hover:bg-olympus-gold/10' :
                        'border-olympus-white/20 text-olympus-white/50 hover:bg-olympus-white/5'
                      }`}
                    >
                      {tattoo.status}
                    </button>
                  </td>
                  <td className="p-4 text-right relative">
                    <button 
                      onClick={() => setOpenDropdownId(openDropdownId === tattoo.id ? null : tattoo.id)}
                      className="text-olympus-white/40 hover:text-olympus-gold p-1 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openDropdownId === tattoo.id && (
                      <div className={`absolute right-4 w-32 bg-olympus-graphite border border-olympus-gold/20 shadow-xl rounded-sm z-50 flex flex-col overflow-hidden ${index >= filteredTattoos.length - 2 && filteredTattoos.length > 3 ? 'bottom-10 mb-2' : 'top-10 mt-2'}`}>
                        <button onClick={() => openEditModal(tattoo)} className="text-left px-4 py-2 text-sm hover:bg-olympus-gold/10 text-olympus-white">Editar</button>
                        <button onClick={() => handleDelete(tattoo.id)} className="text-left px-4 py-2 text-sm hover:bg-olympus-wine/20 text-olympus-wine">Excluir</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTattoos.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-olympus-white/40">
                    Nenhuma arte encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-olympus-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-olympus-graphite border border-olympus-gold/20 rounded-sm w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-olympus-gold/10 flex justify-between items-center bg-olympus-graphite z-10">
              <h2 className="font-serif text-2xl text-olympus-gold">{editingId ? 'Editar Arte' : 'Nova Arte'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-olympus-white/40 hover:text-olympus-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 hide-scrollbar">
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                <div>
                  <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Imagem da Arte</label>
                  <div 
                    className="border-2 border-dashed border-olympus-gold/20 rounded-sm h-48 flex flex-col items-center justify-center bg-olympus-black/50 hover:bg-olympus-black cursor-pointer transition-colors relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center text-olympus-white/40">
                        <Upload size={32} className="mb-2" />
                        <span className="text-sm font-sans">Clique para enviar uma imagem</span>
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
                    <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Título</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Código (ex: OLY-001)</label>
                    <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold font-mono uppercase" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Artista</label>
                    <select value={formData.artist_id} onChange={e => setFormData({...formData, artist_id: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold">
                      <option value="">Selecione...</option>
                      {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Categoria/Estilo</label>
                    <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Preço (R$)</label>
                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2 flex justify-between">
                      <span>Preço Original</span>
                      <label className="flex items-center gap-2 cursor-pointer text-olympus-gold normal-case font-sans">
                        <input type="checkbox" checked={formData.is_promotion} onChange={e => setFormData({...formData, is_promotion: e.target.checked})} className="accent-olympus-gold" />
                        É promoção?
                      </label>
                    </label>
                    <input type="number" step="0.01" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} disabled={!formData.is_promotion} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold font-mono disabled:opacity-50" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Descrição</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold resize-none" />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-olympus-gold/10 bg-olympus-graphite z-10 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-olympus-gold/20 text-olympus-white hover:bg-olympus-white/5">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-olympus-gold text-olympus-black hover:bg-olympus-white flex gap-2">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {editingId ? 'Salvar Alterações' : 'Criar Arte'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
