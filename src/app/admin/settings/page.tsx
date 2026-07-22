"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Plus, Image as ImageIcon, X, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    whatsapp: '',
    hero_image: '',
    about_image: '',
    hero_media_type: 'image',
    hero_youtube_id: '',
    youtube_url_input: ''
  });

  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [aboutPreview, setAboutPreview] = useState<string | null>(null);

  const heroInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLInputElement>(null);
  
  // Gallery state
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const [studioRes, galleryRes] = await Promise.all([
      supabase.from('studio').select('*').limit(1),
      supabase.from('studio_gallery').select('*').order('display_order', { ascending: true })
    ]);
    
    if (galleryRes.data && galleryRes.data.length > 0) {
      setGalleryImages(galleryRes.data);
    } else {
      // Auto-seed if empty
      const fallbackImages = [
        "/photos/WEB.Studio/31.webp", "/photos/WEB.Studio/32.webp", "/photos/WEB.Studio/33.webp", 
        "/photos/WEB.Studio/34.webp", "/photos/WEB.Studio/35.webp", "/photos/WEB.Studio/36.webp", 
        "/photos/WEB.Studio/37.webp", "/photos/WEB.Studio/38.webp", "/photos/WEB.Studio/39.webp", 
        "/photos/WEB.Studio/40.webp", "/photos/WEB.Studio/41.webp"
      ];
      const payload = fallbackImages.map((url, index) => ({
        image_url: url,
        display_order: index
      }));
      const { data: insertedData } = await supabase.from('studio_gallery').insert(payload).select();
      if (insertedData) {
        setGalleryImages(insertedData.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      }
    }
    
    const data = studioRes.data?.[0];
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        whatsapp: data.whatsapp || '',
        hero_image: data.hero_image || '',
        about_image: data.about_image || '',
        hero_media_type: data.hero_media_type || 'image',
        hero_youtube_id: data.hero_youtube_id || '',
        youtube_url_input: data.hero_youtube_id ? `https://youtube.com/watch?v=${data.hero_youtube_id}` : ''
      });
      setHeroPreview(data.hero_image || null);
      setAboutPreview(data.about_image || null);
    } else {
      // Fallbacks to show the user what is currently active on the live site
      setFormData({
        title: 'Olympus',
        description: 'O Melhor Estúdio de Tatuagem de Belo Horizonte',
        whatsapp: '',
        hero_image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=2000',
        about_image: '',
        hero_media_type: 'image',
        hero_youtube_id: '',
        youtube_url_input: ''
      });
      setHeroPreview('https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=2000');
    }
    setLoading(false);
  };

  const extractYouTubeID = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, youtube_url_input: url }));
    
    if (!url) {
      setFormData(prev => ({ ...prev, hero_youtube_id: '' }));
      return;
    }

    const id = extractYouTubeID(url);
    if (id) {
      setFormData(prev => ({ ...prev, hero_youtube_id: id }));
    } else {
      setFormData(prev => ({ ...prev, hero_youtube_id: '' }));
    }
  };

  const fetchGallery = async () => {
    const { data } = await supabase.from('studio_gallery').select('*').order('display_order', { ascending: true });
    if (data) setGalleryImages(data);
  };

  const handleAddGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploadingGallery(true);
    
    try {
      let maxOrder = 0;
      if (galleryImages.length > 0) {
        maxOrder = Math.max(...galleryImages.map(img => img.display_order || 0));
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        });

        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `about/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('olympus')
          .upload(filePath, compressedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('olympus')
          .getPublicUrl(filePath);
          
        const nextOrder = maxOrder + 1 + i;

        const { data, error } = await supabase.from('studio_gallery').insert({
          image_url: publicUrl,
          display_order: nextOrder
        }).select();

        if (error || !data || data.length === 0) {
          throw new Error(error?.message || 'Erro ao inserir imagem no banco.');
        }
      }
      
      await fetchGallery();
    } catch (error) {
      console.error('Error uploading to gallery:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setIsUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleDeleteGalleryImage = async (id: string, imageUrl: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem da galeria?')) return;
    
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/olympus/');
      if (pathParts.length > 1) {
        await supabase.storage.from('olympus').remove([pathParts[1]]);
      }
    } catch (e) {
      console.error("Failed to delete from storage", e);
    }

    await supabase.from('studio_gallery').delete().eq('id', id);
    await fetchGallery();
  };

  const moveGalleryImage = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === galleryImages.length - 1)
    ) return;

    const newGallery = [...galleryImages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap array positions
    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIndex];
    newGallery[targetIndex] = temp;
    
    // Update display_order based on array position
    const updatedItems = newGallery.map((item, idx) => ({
      ...item,
      display_order: idx
    }));
    
    setGalleryImages(updatedItems);

    // Save to DB
    for (const item of updatedItems) {
      await supabase.from('studio_gallery')
        .update({ display_order: item.display_order })
        .eq('id', item.id);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newGallery = [...galleryImages];
    const draggedItem = newGallery[draggedIndex];
    
    newGallery.splice(draggedIndex, 1);
    newGallery.splice(dropIndex, 0, draggedItem);
    
    const updatedItems = newGallery.map((item, idx) => ({
      ...item,
      display_order: idx
    }));
    
    setGalleryImages(updatedItems);
    setDraggedIndex(null);

    for (const item of updatedItems) {
      await supabase.from('studio_gallery')
        .update({ display_order: item.display_order })
        .eq('id', item.id);
    }
  };

  const handleHeroChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroImageFile(file);
    setHeroPreview(URL.createObjectURL(file));
  };

  const handleAboutChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAboutImageFile(file);
    setAboutPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File, folder: string) => {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    });
    const fileExt = compressedFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `studio/${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('olympus')
      .upload(filePath, compressedFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('olympus')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let heroUrl = formData.hero_image;
      let aboutUrl = formData.about_image;

      if (heroImageFile) heroUrl = await uploadImage(heroImageFile, 'hero');

      const payload = {
        title: formData.title,
        description: formData.description,
        whatsapp: formData.whatsapp,
        hero_image: heroUrl,
        about_image: aboutUrl,
        hero_media_type: formData.hero_media_type,
        hero_youtube_id: formData.hero_youtube_id,
      };

      if (formData.hero_media_type === 'video' && formData.youtube_url_input && !formData.hero_youtube_id) {
        alert('Por favor, insira uma URL de YouTube válida antes de salvar.');
        setSaving(false);
        return;
      }

      const { data } = await supabase.from('studio').select('id');
      if (data && data.length > 0) {
        const { error, data: updatedData } = await supabase.from('studio').update(payload).eq('id', data[0].id).select();
        if (error || !updatedData || updatedData.length === 0) throw new Error(error?.message || 'Permissão negada.');
      } else {
        const { error } = await supabase.from('studio').insert([{ ...payload, id: '00000000-0000-0000-0000-000000000000' }]);
        if (error) throw error;
      }

      alert('Configurações salvas com sucesso!');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-olympus-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-olympus-gold">Configurações do Estúdio</h1>
      </div>

      <div className="bg-olympus-graphite border border-olympus-gold/10 rounded-sm overflow-hidden p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          <div className="grid grid-cols-1 gap-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-olympus-white/50 uppercase tracking-widest">Plano de Fundo (Hero)</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({...prev, hero_media_type: 'image'}))}
                    className={`text-xs px-3 py-1 rounded-sm border ${formData.hero_media_type === 'image' ? 'border-olympus-gold text-olympus-gold bg-olympus-gold/10' : 'border-olympus-gold/20 text-olympus-white/50 hover:bg-olympus-white/5'}`}
                  >
                    Imagem
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({...prev, hero_media_type: 'video'}))}
                    className={`text-xs px-3 py-1 rounded-sm border ${formData.hero_media_type === 'video' ? 'border-olympus-gold text-olympus-gold bg-olympus-gold/10' : 'border-olympus-gold/20 text-olympus-white/50 hover:bg-olympus-white/5'}`}
                  >
                    Vídeo
                  </button>
                </div>
              </div>

              {formData.hero_media_type === 'image' ? (
                <div 
                  className="border-2 border-dashed border-olympus-gold/20 rounded-sm h-64 flex flex-col items-center justify-center bg-olympus-black/50 hover:bg-olympus-black cursor-pointer transition-colors relative overflow-hidden"
                  onClick={() => heroInputRef.current?.click()}
                >
                  {heroPreview ? (
                    <img src={heroPreview} alt="Hero Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-olympus-white/40">
                      <Upload size={32} className="mb-2" />
                      <span className="text-sm font-sans">Enviar Imagem</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" ref={heroInputRef} onChange={handleHeroChange} />
                </div>
              ) : (
                <div className="h-64 flex flex-col justify-center bg-olympus-black/30 border border-olympus-gold/10 rounded-sm p-6">
                  <label className="block text-sm text-olympus-white mb-2">URL do Vídeo no YouTube</label>
                  <input 
                    type="text" 
                    placeholder="https://youtube.com/watch?v=..." 
                    value={formData.youtube_url_input} 
                    onChange={handleYoutubeUrlChange} 
                    className={`w-full bg-olympus-black border ${formData.youtube_url_input && !formData.hero_youtube_id ? 'border-olympus-wine focus:border-olympus-wine' : 'border-olympus-gold/20 focus:border-olympus-gold'} rounded-sm px-4 py-3 text-olympus-white focus:outline-none`} 
                  />
                  {formData.youtube_url_input && !formData.hero_youtube_id && (
                    <p className="text-olympus-wine text-xs mt-2 font-mono">URL inválida ou ID não encontrado.</p>
                  )}
                  {formData.hero_youtube_id && (
                    <p className="text-green-400 text-xs mt-2 font-mono">ID detectado: {formData.hero_youtube_id}</p>
                  )}
                  <p className="text-olympus-white/40 text-xs mt-4">
                    O vídeo deve ser hospedado no YouTube (preferencialmente como 'Não Listado'). 
                    Ele será exibido em tela cheia, sem áudio, em loop infinito.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Nome do Estúdio</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold" />
            </div>
            <div>
              <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">WhatsApp</label>
              <input required type="text" placeholder="Ex: 5531999999999" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Descrição (Subtítulo Hero)</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-olympus-black border border-olympus-gold/20 rounded-sm px-4 py-2 text-olympus-white focus:outline-none focus:border-olympus-gold resize-none" />
          </div>

          <div className="flex justify-end pt-4 border-t border-olympus-gold/10">
            <Button type="submit" disabled={saving} className="bg-olympus-gold text-olympus-black hover:bg-olympus-white flex gap-2 px-8">
              {saving && <Loader2 size={16} className="animate-spin" />}
              Salvar Configurações
            </Button>
          </div>
        </form>
      </div>

      {/* Gallery Section */}
      <div className="mt-8 bg-olympus-graphite border border-olympus-gold/10 rounded-sm overflow-hidden p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="font-serif text-xl text-olympus-gold uppercase tracking-widest">Galeria "Sobre Nós" (Letreiro)</h2>
          <span className="text-xs bg-olympus-gold/10 text-olympus-gold px-3 py-1 rounded-sm mt-2 md:mt-0 font-mono border border-olympus-gold/20">
            ✅ Salvo automaticamente
          </span>
        </div>
        
        <p className="text-sm text-olympus-white/60 mb-6 font-light">
          Adicione as fotos do estúdio que aparecerão deslizando no letreiro animado da Home. 
          <strong> Clique e arraste</strong> uma foto para reorganizar a ordem, ou use as setas.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {galleryImages.map((img, index) => (
            <div 
              key={img.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`relative group rounded-sm overflow-hidden border ${draggedIndex === index ? 'border-olympus-gold opacity-50' : 'border-olympus-gold/20'} aspect-square cursor-grab active:cursor-grabbing`}
            >
              <img src={img.image_url} alt="Gallery image" className="w-full h-full object-cover pointer-events-none" />
              
              <div className="absolute inset-0 bg-olympus-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <button 
                    onClick={() => moveGalleryImage(index, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded-sm ${index === 0 ? 'text-olympus-white/20' : 'text-olympus-white hover:bg-olympus-white/20'}`}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button 
                    onClick={() => moveGalleryImage(index, 'down')}
                    disabled={index === galleryImages.length - 1}
                    className={`p-1 rounded-sm ${index === galleryImages.length - 1 ? 'text-olympus-white/20' : 'text-olympus-white hover:bg-olympus-white/20'}`}
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
                <button 
                  onClick={() => handleDeleteGalleryImage(img.id, img.image_url)}
                  className="p-1 text-red-400 hover:bg-red-400/20 rounded-sm self-end"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <div 
            onClick={() => !isUploadingGallery && galleryInputRef.current?.click()}
            className={`border-2 border-dashed border-olympus-gold/20 rounded-sm aspect-square flex flex-col items-center justify-center transition-colors ${isUploadingGallery ? 'opacity-50 cursor-not-allowed bg-olympus-black/50' : 'cursor-pointer hover:bg-olympus-black/50 hover:border-olympus-gold/50'}`}
          >
            {isUploadingGallery ? (
              <Loader2 className="animate-spin text-olympus-gold mb-2" size={24} />
            ) : (
              <Plus className="text-olympus-gold/50 mb-2" size={24} />
            )}
            <span className="text-xs font-mono text-olympus-white/50 uppercase tracking-widest text-center px-2 mt-1 leading-tight">
              {isUploadingGallery ? 'Enviando...' : 'Adicionar Fotos'}
            </span>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            className="hidden" 
            ref={galleryInputRef} 
            onChange={handleAddGalleryImage} 
            disabled={isUploadingGallery}
          />
        </div>
      </div>
    </div>
  );
}
