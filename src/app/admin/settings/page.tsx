"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    whatsapp: '',
    hero_image: '',
    about_image: ''
  });

  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [aboutPreview, setAboutPreview] = useState<string | null>(null);

  const heroInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('studio').select('*').single();
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        whatsapp: data.whatsapp || '',
        hero_image: data.hero_image || '',
        about_image: data.about_image || ''
      });
      setHeroPreview(data.hero_image || null);
      setAboutPreview(data.about_image || null);
    }
    setLoading(false);
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
      if (aboutImageFile) aboutUrl = await uploadImage(aboutImageFile, 'about');

      const payload = {
        title: formData.title,
        description: formData.description,
        whatsapp: formData.whatsapp,
        hero_image: heroUrl,
        about_image: aboutUrl,
      };

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Imagem Principal (Hero)</label>
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
            </div>

            <div>
              <label className="block text-xs font-mono text-olympus-white/50 uppercase tracking-widest mb-2">Imagem Sobre Nós</label>
              <div 
                className="border-2 border-dashed border-olympus-gold/20 rounded-sm h-64 flex flex-col items-center justify-center bg-olympus-black/50 hover:bg-olympus-black cursor-pointer transition-colors relative overflow-hidden"
                onClick={() => aboutInputRef.current?.click()}
              >
                {aboutPreview ? (
                  <img src={aboutPreview} alt="About Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-olympus-white/40">
                    <Upload size={32} className="mb-2" />
                    <span className="text-sm font-sans">Enviar Imagem</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" ref={aboutInputRef} onChange={handleAboutChange} />
              </div>
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
    </div>
  );
}
