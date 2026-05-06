import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Gift } from '../types';
import { Trash2, Plus, Loader2, ArrowLeft } from 'lucide-react';

export const AdminGifts: React.FC = () => {
  const navigate = useNavigate();
  const [gifts, setGifts] = useState<Gift[]>([]);

  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Event Settings State
  const [settings, setSettings] = useState({
    invitation_title: '',
    invitation_body: '',
    location_url: '',
    rsvp_link: '',
    invitation_bg_url: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchGifts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar presentes:', error);
    } else {
      setGifts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setLoading(true);

      // Load Gifts
      const { data: giftsData } = await supabase
        .from('gifts')
        .select('*')
        .order('created_at', { ascending: false });

      // Load Settings
      const { data: settingsData } = await supabase
        .from('event_settings')
        .select('*');

      if (!ignore) {
        if (giftsData) setGifts(giftsData);
        if (settingsData) {
          const s: any = {};
          settingsData.forEach(item => {
            s[item.key] = item.value;
          });
          setSettings(prev => ({ ...prev, ...s }));
        }
        setLoading(false);
      }
    };

    loadData();
    return () => { ignore = true; };
  }, [fetchGifts]);

  const handleUpdateSetting = async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveAllSettings = async () => {
    setIsSavingSettings(true);
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value
    }));

    const { error } = await supabase
      .from('event_settings')
      .upsert(updates, { onConflict: 'key' });

    if (error) {
      alert('Erro ao salvar configurações');
    } else {
      alert('Configurações salvas com sucesso!');
    }
    setIsSavingSettings(false);
  };

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const { error } = await supabase
      .from('gifts')
      .insert([{ name: newName, link: newLink, price: newPrice }]);

    if (error) {
      alert('Erro ao adicionar presente');
    } else {
      setNewName('');
      setNewLink('');
      setNewPrice('');
      fetchGifts();
    }
  };

  const handleDeleteGift = async (id: string) => {
    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao remover presente');
    } else {
      fetchGifts();
    }
  };

  return (
    <div className="admin-container" style={{
      padding: '40px 20px',
      maxWidth: '800px',
      margin: '0 auto',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#ffeb95', fontSize: '2.5rem', marginBottom: '10px', textShadow: '2px 2px 0 #000' }}>
          Painel Administrativo
        </h1>
        <p style={{ color: 'white', opacity: 0.8 }}>Gerencie o conteúdo do convite e a lista de presentes</p>
      </div>

      {/* Seção de Configurações do Convite */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '24px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        marginBottom: '40px'
      }}>
        <h2 style={{ color: '#1e293b', marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📝 Conteúdo do Convite
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Título do Convite</label>
            <input
              type="text"
              value={settings.invitation_title}
              onChange={(e) => handleUpdateSetting('invitation_title', e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Texto Interno</label>
            <textarea
              rows={3}
              value={settings.invitation_body}
              onChange={(e) => handleUpdateSetting('invitation_body', e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Link do Google Maps</label>
              <input
                type="text"
                value={settings.location_url}
                onChange={(e) => handleUpdateSetting('location_url', e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Link confirmação</label>
              <input
                type="text"
                value={settings.rsvp_link}
                onChange={(e) => handleUpdateSetting('rsvp_link', e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Imagem de Fundo do Convite</label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <input
                  type="text"
                  value={settings.invitation_bg_url}
                  onChange={(e) => handleUpdateSetting('invitation_bg_url', e.target.value)}
                  placeholder="URL da imagem (ex: https://...)"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', marginBottom: '10px' }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setIsSavingSettings(true);
                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${Date.now()}.${fileExt}`;
                      const filePath = `invitations/${fileName}`;

                      const { error: uploadError } = await supabase.storage
                        .from('images')
                        .upload(filePath, file);

                      if (uploadError) throw uploadError;

                      const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(filePath);

                      handleUpdateSetting('invitation_bg_url', publicUrl);
                    } catch (error: any) {
                      console.error('Erro no upload:', error);
                      alert('Erro ao fazer upload. Certifique-se que o bucket "images" está configurado como público no Supabase.');
                    } finally {
                      setIsSavingSettings(false);
                    }
                  }}
                  style={{ fontSize: '0.8rem', color: '#64748b' }}
                />
              </div>
              {settings.invitation_bg_url && (
                <div style={{ width: '120px', height: '120px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #e2e8f0', background: '#f8fafc', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <img src={settings.invitation_bg_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '8px' }}>
              Dica: Você pode colar um link ou fazer upload. A imagem substituirá o texto interno por uma arte pronta.
            </p>
          </div>
          <button
            onClick={saveAllSettings}
            disabled={isSavingSettings}
            style={{
              padding: '14px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 700,
              marginTop: '10px',
              opacity: isSavingSettings ? 0.7 : 1,
              width: '100%'
            }}
          >
            {isSavingSettings ? 'Salvando...' : 'Atualizar Informações do Convite'}
          </button>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '24px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        marginBottom: '40px'
      }}>
        <h2 style={{ color: '#1e293b', marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🎁 Novo Presente
        </h2>
        <form onSubmit={handleAddGift} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Nome do Item *</label>
            <input
              type="text"
              placeholder="Ex: Carrinho"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Preço Sugerido</label>
            <input
              type="text"
              placeholder="Ex: R$ 250,00"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Link da Loja</label>
            <input
              type="text"
              placeholder="Ex: https://amazon.com/..."
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" style={{
            gridColumn: 'span 2',
            padding: '14px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '10px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            <Plus size={20} /> Salvar Presente
          </button>
        </form>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        padding: '30px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '1.2rem' }}>Lista de Sugestões</h2>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" color="white" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {gifts.map((gift) => (
              <div key={gift.id} style={{
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ color: '#1e293b', margin: 0, fontSize: '1.1rem' }}>{gift.name}</h3>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                    {gift.price && <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>💰 {gift.price}</span>}
                    {gift.link && (
                      <a href={gift.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
                        🔗 Link da Loja
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteGift(gift.id)}
                  style={{
                    background: '#fee2e2',
                    border: 'none',
                    color: '#ef4444',
                    padding: '10px',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {gifts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'white', opacity: 0.5 }}>
                <p>Nenhum presente na lista ainda.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          onClick={() => navigate('/convite')}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <ArrowLeft size={18} /> Voltar para o Convite
        </button>
      </div>
    </div>
  );
};
