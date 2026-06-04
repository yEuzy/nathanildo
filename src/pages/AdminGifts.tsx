import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Gift } from '../types';
import { Trash2, Plus, Loader2, ArrowLeft } from 'lucide-react';
import { VisualEditor } from '../components/VisualEditor';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const AdminGifts: React.FC = () => {
  const navigate = useNavigate();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
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
    invitation_bg_url: '',
    invitation_title_color: '',
    invitation_body_color: '',
    show_gifts_btn: 'true',
    bg_overlay_opacity: '0',
    invitation_alignment: 'center',
    editor_layout: '',
    confirmed_guests: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Confirmed Guests State
  const [confirmedGuests, setConfirmedGuests] = useState<any[]>([]);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any | null>(null);
  const [modalGuestName, setModalGuestName] = useState('');
  const [modalCompanions, setModalCompanions] = useState<string[]>([]);
  const [modalNewCompanion, setModalNewCompanion] = useState('');

  // Tabs & Scanner State
  const [activeTab, setActiveTab] = useState<'gifts' | 'confirmations' | 'scanner'>('gifts');
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'warning' | 'error';
    message: string;
    guest?: any;
    name?: string;
  } | null>(null);

  // Sync confirmedGuests with settings
  useEffect(() => {
    if (settings.confirmed_guests) {
      try {
        const parsed = JSON.parse(settings.confirmed_guests);
        if (Array.isArray(parsed)) {
          setConfirmedGuests(parsed);
          return;
        }
      } catch (e) {
        console.error('Erro ao ler convidados confirmados:', e);
      }
    }
    setConfirmedGuests([]);
  }, [settings.confirmed_guests]);

  // Save the entire list back to database
  const saveConfirmedGuestsList = async (newList: any[]) => {
    const { error } = await supabase
      .from('event_settings')
      .upsert({
        key: 'confirmed_guests',
        value: JSON.stringify(newList)
      }, { onConflict: 'key' });

    if (error) {
      alert('Erro ao salvar lista de confirmados');
    } else {
      setSettings(prev => ({
        ...prev,
        confirmed_guests: JSON.stringify(newList)
      }));
    }
  };

  const handleOpenAddGuest = () => {
    setEditingGuest(null);
    setModalGuestName('');
    setModalCompanions([]);
    setModalNewCompanion('');
    setIsGuestModalOpen(true);
  };

  const handleOpenEditGuest = (guest: any) => {
    setEditingGuest(guest);
    setModalGuestName(guest.name || '');
    setModalCompanions(guest.companions || []);
    setModalNewCompanion('');
    setIsGuestModalOpen(true);
  };

  const handleAddModalCompanion = () => {
    if (modalNewCompanion.trim()) {
      setModalCompanions(prev => [...prev, modalNewCompanion.trim()]);
      setModalNewCompanion('');
    }
  };

  const handleRemoveModalCompanion = (index: number) => {
    setModalCompanions(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleCheckIn = async (guestId: string) => {
    const newList = confirmedGuests.map(g => {
      if (g.id === guestId) {
        const currentlyCheckedIn = !!g.checkedIn;
        return {
          ...g,
          checkedIn: !currentlyCheckedIn,
          checkedInAt: !currentlyCheckedIn ? new Date().toISOString() : null
        };
      }
      return g;
    });
    await saveConfirmedGuestsList(newList);
  };

  const handleQuickAddAndCheckIn = async (name: string) => {
    const newGuest = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      companions: [],
      confirmedAt: new Date().toISOString(),
      checkedIn: true,
      checkedInAt: new Date().toISOString()
    };
    const newList = [...confirmedGuests, newGuest];
    await saveConfirmedGuestsList(newList);
    setScanResult({
      status: 'success',
      message: `Convidado "${name}" adicionado e check-in realizado com sucesso!`,
      guest: newGuest
    });
  };

  const handleSaveGuestModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalGuestName.trim()) return;

    let newList = [...confirmedGuests];

    if (editingGuest) {
      newList = newList.map(g => g.id === editingGuest.id ? {
        ...g,
        name: modalGuestName.trim(),
        companions: modalCompanions
      } : g);
    } else {
      const newGuest = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: modalGuestName.trim(),
        companions: modalCompanions,
        confirmedAt: new Date().toISOString()
      };
      newList.push(newGuest);
    }

    await saveConfirmedGuestsList(newList);
    setIsGuestModalOpen(false);
  };

  const handleDeleteConfirmedGuest = async (guestId: string) => {
    if (confirm('Tem certeza que deseja remover este convidado confirmado?')) {
      const newList = confirmedGuests.filter(g => g.id !== guestId);
      await saveConfirmedGuestsList(newList);
    }
  };

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

      console.log("SETTINGS DATA FROM DB:", settingsData);

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

    // Subscribe to realtime database changes
    const giftsChannel = supabase
      .channel('gifts-realtime-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gifts' },
        () => {
          fetchGifts();
        }
      )
      .subscribe();

    const settingsChannel = supabase
      .channel('settings-realtime-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_settings' },
        (payload) => {
          const newRow = payload.new as any;
          if (newRow && newRow.key !== undefined && newRow.value !== undefined) {
            setSettings(prev => ({
              ...prev,
              [newRow.key]: newRow.value
            }));
          }
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(giftsChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [fetchGifts]);

  // Scanner Effect
  useEffect(() => {
    if (activeTab !== 'scanner' || scanResult) return;

    const timer = setTimeout(() => {
      const container = document.getElementById("reader");
      if (!container) return;

      const scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: (width, height) => {
            const min = Math.min(width, height);
            return {
              width: Math.floor(min * 0.7),
              height: Math.floor(min * 0.7)
            };
          },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      const onScanSuccess = async (decodedText: string) => {
        let scannedName = decodedText;
        if (decodedText.startsWith('invite:')) {
          scannedName = decodedText.substring(7);
        }
        scannedName = scannedName.trim();

        // Find guest (case-insensitive)
        const matchedGuest = confirmedGuests.find(
          g => g.name.toLowerCase() === scannedName.toLowerCase()
        );

        if (matchedGuest) {
          if (matchedGuest.checkedIn) {
            setScanResult({
              status: 'warning',
              message: `O convidado "${matchedGuest.name}" já realizou o check-in!`,
              guest: matchedGuest
            });
          } else {
            const updatedList = confirmedGuests.map(g => {
              if (g.id === matchedGuest.id) {
                return {
                  ...g,
                  checkedIn: true,
                  checkedInAt: new Date().toISOString()
                };
              }
              return g;
            });
            await saveConfirmedGuestsList(updatedList);
            setScanResult({
              status: 'success',
              message: `Check-in realizado com sucesso para "${matchedGuest.name}"!`,
              guest: { ...matchedGuest, checkedIn: true, checkedInAt: new Date().toISOString() }
            });
          }
        } else {
          setScanResult({
            status: 'error',
            message: `Convidado "${scannedName}" não encontrado na lista de confirmados!`,
            name: scannedName
          });
        }
      };

      const onScanFailure = () => {
        // Continuous scans fail when no QR is in sight, ignore
      };

      scanner.render(onScanSuccess, onScanFailure);

      return () => {
        scanner.clear().catch(err => console.error("Erro ao fechar o scanner:", err));
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTab, scanResult, confirmedGuests]);

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
        <p style={{ color: 'white', opacity: 0.8 }}>Gerencie o conteúdo do convite, lista de presentes e faça check-in dos convidados</p>
      </div>

      {/* Tab Selector Navigation */}
      <div style={{
        display: 'flex',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '6px',
        borderRadius: '16px',
        marginBottom: '30px',
        gap: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <button
          onClick={() => { setActiveTab('gifts'); setScanResult(null); }}
          style={{
            flex: 1,
            padding: '12px 8px',
            background: activeTab === 'gifts' ? 'white' : 'transparent',
            color: activeTab === 'gifts' ? '#1e293b' : 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          🎁 Painel & Presentes
        </button>
        <button
          onClick={() => { setActiveTab('confirmations'); setScanResult(null); }}
          style={{
            flex: 1,
            padding: '12px 8px',
            background: activeTab === 'confirmations' ? 'white' : 'transparent',
            color: activeTab === 'confirmations' ? '#1e293b' : 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          👥 Confirmados ({confirmedGuests.length})
        </button>
        <button
          onClick={() => { setActiveTab('scanner'); setScanResult(null); }}
          style={{
            flex: 1,
            padding: '12px 8px',
            background: activeTab === 'scanner' ? 'white' : 'transparent',
            color: activeTab === 'scanner' ? '#1e293b' : 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          📷 Leitor QR Code
        </button>
      </div>

      {/* Tab 1: Gifts and settings */}
      {activeTab === 'gifts' && (
        <>
          {/* Seção de Configurações do Convite */}
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            marginBottom: '40px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📝 Conteúdo do Convite
              </h2>
              <button
                onClick={() => setIsEditorOpen(true)}
                style={{
                  padding: '8px 16px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
                }}
              >
                🎨 Editar Sobre o Convite (WYSIWYG)
              </button>
            </div>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Cor do Título</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="color"
                      value={settings.invitation_title_color || '#1e40af'}
                      onChange={(e) => handleUpdateSetting('invitation_title_color', e.target.value)}
                      style={{ width: '42px', height: '42px', padding: '0', border: '2px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text"
                      value={settings.invitation_title_color || '#1e40af'}
                      onChange={(e) => handleUpdateSetting('invitation_title_color', e.target.value)}
                      style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Cor do Texto</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="color"
                      value={settings.invitation_body_color || '#64748b'}
                      onChange={(e) => handleUpdateSetting('invitation_body_color', e.target.value)}
                      style={{ width: '42px', height: '42px', padding: '0', border: '2px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text"
                      value={settings.invitation_body_color || '#64748b'}
                      onChange={(e) => handleUpdateSetting('invitation_body_color', e.target.value)}
                      style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Link de RSVP (WhatsApp)</label>
                  <input
                    type="text"
                    value={settings.rsvp_link}
                    onChange={(e) => handleUpdateSetting('rsvp_link', e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Link de Localização (Google Maps)</label>
                  <input
                    type="text"
                    value={settings.location_url}
                    onChange={(e) => handleUpdateSetting('location_url', e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Exibir Botão Dicas de Presentes?</label>
                  <select
                    value={settings.show_gifts_btn}
                    onChange={(e) => handleUpdateSetting('show_gifts_btn', e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', background: 'white' }}
                  >
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Alinhamento do Texto</label>
                  <select
                    value={settings.invitation_alignment || 'center'}
                    onChange={(e) => handleUpdateSetting('invitation_alignment', e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', background: 'white' }}
                  >
                    <option value="left">Esquerda</option>
                    <option value="center">Centralizado</option>
                    <option value="right">Direita</option>
                    <option value="space-between">Justificado</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>Opacidade do Fundo Escuro (0 a 100)%</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.bg_overlay_opacity || '0'}
                  onChange={(e) => handleUpdateSetting('bg_overlay_opacity', e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                />
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
        </>
      )}

      {/* Tab 2: Guest Confirmations List */}
      {activeTab === 'confirmations' && (
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              👥 Pessoas Confirmadas ({confirmedGuests.length})
            </h2>
            <button
              onClick={handleOpenAddGuest}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} /> Convidado Manual
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {confirmedGuests.map((guest) => {
              const dateStr = guest.confirmedAt
                ? new Date(guest.confirmedAt).toLocaleString('pt-BR')
                : 'Sem data';

              return (
                <div key={guest.id} style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '15px'
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>{guest.name}</span>
                      {guest.checkedIn ? (
                        <span style={{
                          fontSize: '0.75rem',
                          background: '#dcfce7',
                          color: '#15803d',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                          Presente
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.75rem',
                          background: '#f1f5f9',
                          color: '#64748b',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }}></span>
                          Ausente
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '20px' }}>
                        {dateStr}
                      </span>
                    </div>
                    {guest.companions && guest.companions.length > 0 ? (
                      <div style={{ marginTop: '10px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                          Acompanhantes ({guest.companions.length}):
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {guest.companions.map((comp: string, i: number) => (
                            <span key={i} style={{ fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '20px', fontWeight: 500 }}>
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Nenhum acompanhante cadastrado.
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleToggleCheckIn(guest.id)}
                      style={{
                        background: guest.checkedIn ? '#fee2e2' : '#dcfce7',
                        border: 'none',
                        color: guest.checkedIn ? '#ef4444' : '#15803d',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                    >
                      {guest.checkedIn ? 'Check-out' : 'Check-in'}
                    </button>
                    <button
                      onClick={() => handleOpenEditGuest(guest)}
                      style={{
                        background: '#e0f2fe',
                        border: 'none',
                        color: '#0284c7',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteConfirmedGuest(guest.id)}
                      style={{
                        background: '#fee2e2',
                        border: 'none',
                        color: '#ef4444',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}

            {confirmedGuests.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', opacity: 0.7 }}>
                <p>Nenhuma presença confirmada ainda.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: QR Code Ticket Scanner */}
      {activeTab === 'scanner' && (
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          marginBottom: '40px'
        }}>
          <h2 style={{ color: '#1e293b', marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📷 Check-in via QR Code
          </h2>

          {scanResult ? (
            <div style={{
              background: scanResult.status === 'success' ? '#f0fdf4' : scanResult.status === 'warning' ? '#fffbeb' : '#fef2f2',
              border: `2px solid ${scanResult.status === 'success' ? '#bbf7d0' : scanResult.status === 'warning' ? '#fef3c7' : '#fecaca'}`,
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center',
              marginBottom: '20px',
              color: scanResult.status === 'success' ? '#166534' : scanResult.status === 'warning' ? '#92400e' : '#991b1b'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
                {scanResult.status === 'success' ? '✅' : scanResult.status === 'warning' ? '⚠️' : '❌'}
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 10px 0' }}>
                {scanResult.status === 'success' ? 'Check-in Confirmado!' : scanResult.status === 'warning' ? 'Atenção!' : 'Convidado Não Encontrado'}
              </h3>
              <p style={{ fontSize: '1rem', margin: '0 0 20px 0', opacity: 0.9 }}>
                {scanResult.message}
              </p>

              {scanResult.guest && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '12px',
                  padding: '15px',
                  maxWidth: '300px',
                  margin: '0 auto 20px auto',
                  textAlign: 'left',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>
                    {scanResult.guest.name}
                  </div>
                  {scanResult.guest.companions && scanResult.guest.companions.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        Acompanhantes ({scanResult.guest.companions.length}):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {scanResult.guest.companions.map((c: string, idx: number) => (
                          <span key={idx} style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.05)', color: '#334155', padding: '2px 8px', borderRadius: '12px' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {scanResult.guest.checkedInAt && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                      Entrada: {new Date(scanResult.guest.checkedInAt).toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {scanResult.status === 'error' && scanResult.name && (
                  <button
                    onClick={() => handleQuickAddAndCheckIn(scanResult.name!)}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    Adicionar e Fazer Check-in
                  </button>
                )}
                <button
                  onClick={() => setScanResult(null)}
                  style={{
                    background: scanResult.status === 'success' ? '#166534' : scanResult.status === 'warning' ? '#92400e' : '#991b1b',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  Escanear Próximo
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '20px', textAlign: 'center' }}>
                Aponte a câmera do dispositivo para o QR Code do ingresso do convidado.
              </p>
              <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                <div id="reader" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
        </div>
      )}

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

      {isEditorOpen && (
        <VisualEditor
          settings={settings}
          onSave={async () => {
            const { data: settingsData } = await supabase.from('event_settings').select('*');
            if (settingsData) {
              const s: any = {};
              settingsData.forEach(item => {
                s[item.key] = item.value;
              });
              setSettings(prev => ({ ...prev, ...s }));
            }
          }}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {/* Modal de Adicionar/Editar Convidado Confirmado */}
      {isGuestModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 20, 30, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 11000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            width: '100%',
            maxWidth: '450px',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            color: '#1e293b'
          }}>
            <h2 style={{ color: '#1e40af', marginBottom: '20px', fontFamily: 'system-ui, sans-serif', fontSize: '1.4rem', fontWeight: 700 }}>
              {editingGuest ? 'Editar Convidado' : 'Adicionar Convidado'}
            </h2>

            <form onSubmit={handleSaveGuestModal}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>
                  Nome do Convidado
                </label>
                <input
                  type="text"
                  placeholder="Nome do Convidado"
                  required
                  value={modalGuestName}
                  onChange={(e) => setModalGuestName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>
                  Adicionar Acompanhante
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Nome do acompanhante"
                    value={modalNewCompanion}
                    onChange={(e) => setModalNewCompanion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddModalCompanion();
                      }
                    }}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddModalCompanion}
                    style={{
                      padding: '10px 16px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}
                  >
                    Adicionar
                  </button>
                </div>

                {/* Lista de Acompanhantes */}
                {modalCompanions.length > 0 && (
                  <div style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    marginTop: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {modalCompanions.map((comp, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#f1f5f9',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontSize: '0.85rem'
                      }}>
                        <span style={{ fontWeight: 500, color: '#334155' }}>{comp}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveModalCompanion(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(false)}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
