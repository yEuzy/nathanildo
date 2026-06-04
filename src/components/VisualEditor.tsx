import React, { useState, useRef } from 'react';
import { 
  Eye, EyeOff, Lock, Unlock, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Bold, Italic, Underline, ChevronUp, ChevronDown, Monitor, Smartphone, Save, ArrowLeft, Type,
  Sparkles, Sliders, Layers as LayersIcon, Trash2, Plus
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ElementSettings {
  id: string;
  name: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  color: string;
  backgroundColor?: string;
  align: 'left' | 'center' | 'right' | 'justify' | 'space-between';
  lineHeight: number;
  letterSpacing: number;
  opacity: number;
  shadow: boolean;
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
  rotation: number;
  visible: boolean;
  locked: boolean;
}

interface EditorLayout {
  canvasWidth: number;
  canvasHeight: number;
  elements: Record<string, ElementSettings>;
  layerOrder: string[];
}

interface VisualEditorProps {
  settings: any;
  onSave: (newLayoutString: string) => Promise<void>;
  onClose: () => void;
}

const DEFAULT_FONTS = [
  'Fredoka',
  'Dancing Script',
  'Outfit',
  'Playfair Display',
  'Montserrat',
  'Poppins',
  'Cinzel'
];

export const VisualEditor: React.FC<VisualEditorProps> = ({ settings, onSave, onClose }) => {
  const [layout, setLayout] = useState<EditorLayout>(() => {
    if (settings.editor_layout) {
      try {
        return JSON.parse(settings.editor_layout);
      } catch (e) {
        console.error('Erro ao fazer parse do layout salvo:', e);
      }
    }
    
    // Default initial layout
    return {
      canvasWidth: 400,
      canvasHeight: 500,
      elements: {
        titulo: {
          id: 'titulo',
          name: 'Título',
          text: 'Nome do Convidado',
          x: 20,
          y: 60,
          width: 360,
          height: 60,
          fontSize: 32,
          fontFamily: 'Dancing Script',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#1e40af',
          align: 'center',
          lineHeight: 1.2,
          letterSpacing: 0,
          opacity: 100,
          shadow: false,
          stroke: false,
          strokeColor: '#ffffff',
          strokeWidth: 1,
          rotation: 0,
          visible: true,
          locked: false
        },
        mensagem: {
          id: 'mensagem',
          name: 'Mensagem',
          text: settings.invitation_body || 'Escreva sua mensagem aqui...',
          x: 20,
          y: 130,
          width: 360,
          height: 120,
          fontSize: 14,
          fontFamily: 'Fredoka',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#64748b',
          align: 'center',
          lineHeight: 1.5,
          letterSpacing: 0,
          opacity: 100,
          shadow: false,
          stroke: false,
          strokeColor: '#ffffff',
          strokeWidth: 1,
          rotation: 0,
          visible: true,
          locked: false
        },
        data: {
          id: 'data',
          name: 'Data',
          text: 'Sábado, 21 de Junho de 2026',
          x: 20,
          y: 270,
          width: 360,
          height: 30,
          fontSize: 16,
          fontFamily: 'Fredoka',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#1e40af',
          align: 'center',
          lineHeight: 1.2,
          letterSpacing: 0,
          opacity: 100,
          shadow: false,
          stroke: false,
          strokeColor: '#ffffff',
          strokeWidth: 1,
          rotation: 0,
          visible: true,
          locked: false
        },
        hora: {
          id: 'hora',
          name: 'Hora',
          text: 'às 12:00h',
          x: 20,
          y: 310,
          width: 360,
          height: 30,
          fontSize: 16,
          fontFamily: 'Fredoka',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#64748b',
          align: 'center',
          lineHeight: 1.2,
          letterSpacing: 0,
          opacity: 100,
          shadow: false,
          stroke: false,
          strokeColor: '#ffffff',
          strokeWidth: 1,
          rotation: 0,
          visible: true,
          locked: false
        },
        local: {
          id: 'local',
          name: 'Local',
          text: 'Salão de Festas - Rua das Flores, 123',
          x: 20,
          y: 350,
          width: 360,
          height: 30,
          fontSize: 12,
          fontFamily: 'Fredoka',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#64748b',
          align: 'center',
          lineHeight: 1.2,
          letterSpacing: 0,
          opacity: 100,
          shadow: false,
          stroke: false,
          strokeColor: '#ffffff',
          strokeWidth: 1,
          rotation: 0,
          visible: true,
          locked: false
        },
        observacoes: {
          id: 'observacoes',
          name: 'Observações',
          text: 'Confirme sua presença clicando no botão abaixo.',
          x: 20,
          y: 390,
          width: 360,
          height: 30,
          fontSize: 11,
          fontFamily: 'Fredoka',
          fontWeight: 'normal',
          fontStyle: 'italic',
          textDecoration: 'none',
          color: '#94a3b8',
          align: 'center',
          lineHeight: 1.2,
          letterSpacing: 0,
          opacity: 100,
          shadow: false,
          stroke: false,
          strokeColor: '#ffffff',
          strokeWidth: 1,
          rotation: 0,
          visible: true,
          locked: false
        },
        botao_confirmar: {
          id: 'botao_confirmar',
          name: 'Botão Confirmar',
          text: 'Confirmar Presença',
          x: 100,
          y: 435,
          width: 200,
          height: 42,
          fontSize: 14,
          fontFamily: 'Fredoka',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#ffffff',
          backgroundColor: '#2563eb',
          align: 'center',
          lineHeight: 1.2,
          letterSpacing: 0,
          opacity: 100,
          shadow: true,
          stroke: false,
          strokeColor: '#ffffff',
          strokeWidth: 1,
          rotation: 0,
          visible: true,
          locked: false
        },
        botao_local: {
          id: 'botao_local',
          name: 'Botão Local',
          text: 'Ver Local',
          x: 100,
          y: 390,
          width: 200,
          height: 42,
          fontSize: 14,
          fontFamily: 'Fredoka',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#ffffff',
          backgroundColor: '#059669',
          align: 'center',
          lineHeight: 1.2,
          letterSpacing: 0,
          opacity: 100,
          shadow: true,
          stroke: false,
          strokeColor: '#ffffff',
          strokeWidth: 1,
          rotation: 0,
          visible: false,
          locked: false
        },
        botao_dicas: {
          id: 'botao_dicas',
          name: 'Botão Dicas',
          text: 'Dicas de Presente',
          x: 100,
          y: 345,
          width: 200,
          height: 42,
          fontSize: 14,
          fontFamily: 'Fredoka',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#ffffff',
          backgroundColor: '#3b82f6',
          align: 'center',
          lineHeight: 1.2,
          letterSpacing: 0,
          opacity: 100,
          shadow: true,
          stroke: false,
          strokeColor: '#ffffff',
          strokeWidth: 1,
          rotation: 0,
          visible: false,
          locked: false
        }
      },
      layerOrder: ['titulo', 'mensagem', 'data', 'hora', 'local', 'observacoes', 'botao_confirmar', 'botao_local', 'botao_dicas']
    };
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [activeTab, setActiveTab] = useState<'layers' | 'general'>('layers');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [bgUrl, setBgUrl] = useState(settings.invitation_bg_url || '');
  const [bgOpacity, setBgOpacity] = useState(Number(settings.bg_overlay_opacity || 0));
  const [isSaving, setIsSaving] = useState(false);

  // Snapping Guides state
  const [guideH, setGuideH] = useState<number | null>(null);
  const [guideV, setGuideV] = useState<number | null>(null);

  // Dragging refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragInfoRef = useRef<{
    startX: number;
    startY: number;
    startElemX: number;
    startElemY: number;
    startWidth: number;
    startHeight: number;
    action: 'drag' | 'resize-br' | 'resize-bl' | 'resize-tr' | 'resize-tl' | 'rotate' | null;
  }>({
    startX: 0,
    startY: 0,
    startElemX: 0,
    startElemY: 0,
    startWidth: 0,
    startHeight: 0,
    action: null
  });

  const selectedElement = selectedId ? layout.elements[selectedId] : null;

  // Handle outside clicks to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || e.target === canvasRef.current) {
      setSelectedId(null);
      setIsEditingInline(false);
    }
  };

  // Drag / Resize / Rotate start
  const handleActionStart = (
    e: React.MouseEvent | React.TouchEvent,
    elementId: string,
    action: 'drag' | 'resize-br' | 'resize-bl' | 'resize-tr' | 'resize-tl' | 'rotate'
  ) => {
    const element = layout.elements[elementId];
    if (element.locked && action !== 'rotate') return;

    setSelectedId(elementId);
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragInfoRef.current = {
      startX: clientX,
      startY: clientY,
      startElemX: element.x,
      startElemY: element.y,
      startWidth: element.width,
      startHeight: element.height,
      action
    };

    document.addEventListener('mousemove', handleActionMove);
    document.addEventListener('mouseup', handleActionEnd);
    document.addEventListener('touchmove', handleActionMove, { passive: false });
    document.addEventListener('touchend', handleActionEnd);
  };

  const handleActionMove = (e: MouseEvent | TouchEvent) => {
    if (!selectedId) return;
    const dragInfo = dragInfoRef.current;
    const action = dragInfo.action;
    if (!action) return;

    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - dragInfo.startX;
    const dy = clientY - dragInfo.startY;

    setLayout(prev => {
      const updatedElements = { ...prev.elements };
      const element = { ...updatedElements[selectedId] };

      if (action === 'drag') {
        let newX = dragInfo.startElemX + dx;
        let newY = dragInfo.startElemY + dy;

        // Snapping logic (5px threshold)
        const elementCenterX = newX + element.width / 2;
        const elementCenterY = newY + element.height / 2;
        const canvasCenterX = prev.canvasWidth / 2;
        const canvasCenterY = prev.canvasHeight / 2;

        // Vertical Snap to Center
        if (Math.abs(elementCenterX - canvasCenterX) < 6) {
          newX = canvasCenterX - element.width / 2;
          setGuideV(canvasCenterX);
        } else {
          setGuideV(null);
        }

        // Horizontal Snap to Center
        if (Math.abs(elementCenterY - canvasCenterY) < 6) {
          newY = canvasCenterY - element.height / 2;
          setGuideH(canvasCenterY);
        } else {
          setGuideH(null);
        }

        element.x = newX;
        element.y = newY;
      } else if (action.startsWith('resize')) {
        // Simple resizing
        if (action === 'resize-br') {
          element.width = Math.max(50, dragInfo.startWidth + dx);
          element.height = Math.max(20, dragInfo.startHeight + dy);
        } else if (action === 'resize-bl') {
          const newWidth = Math.max(50, dragInfo.startWidth - dx);
          if (newWidth > 50) {
            element.x = dragInfo.startElemX + dx;
            element.width = newWidth;
          }
          element.height = Math.max(20, dragInfo.startHeight + dy);
        }
      } else if (action === 'rotate') {
        // Calculate angle from element center
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const elemCenterX = rect.left + element.x + element.width / 2;
          const elemCenterY = rect.top + element.y + element.height / 2;
          const angle = Math.atan2(clientY - elemCenterY, clientX - elemCenterX);
          let degrees = Math.round(angle * (180 / Math.PI)) - 90; // offset rotate handle at bottom
          if (degrees < 0) degrees += 360;
          element.rotation = degrees % 360;
        }
      }

      updatedElements[selectedId] = element;
      return {
        ...prev,
        elements: updatedElements
      };
    });
  };

  const handleActionEnd = () => {
    dragInfoRef.current.action = null;
    setGuideH(null);
    setGuideV(null);
    document.removeEventListener('mousemove', handleActionMove);
    document.removeEventListener('mouseup', handleActionEnd);
    document.removeEventListener('touchmove', handleActionMove);
    document.removeEventListener('touchend', handleActionEnd);
  };

  // Helper to update properties
  const updateSelectedProperty = <K extends keyof ElementSettings>(key: K, value: ElementSettings[K]) => {
    if (!selectedId) return;
    setLayout(prev => {
      const updatedElements = { ...prev.elements };
      updatedElements[selectedId] = {
        ...updatedElements[selectedId],
        [key]: value
      };
      return {
        ...prev,
        elements: updatedElements
      };
    });
  };

  // Layer Reordering Actions
  const moveLayer = (direction: 'up' | 'down', elementId: string) => {
    setLayout(prev => {
      const order = [...prev.layerOrder];
      const index = order.indexOf(elementId);
      if (index === -1) return prev;

      if (direction === 'up' && index < order.length - 1) {
        order[index] = order[index + 1];
        order[index + 1] = elementId;
      } else if (direction === 'down' && index > 0) {
        order[index] = order[index - 1];
        order[index - 1] = elementId;
      }

      return { ...prev, layerOrder: order };
    });
  };

  const addNewTextElement = () => {
    const id = `texto_${Date.now()}`;
    const name = `Mensagem Extra`;
    const newElement: ElementSettings = {
      id,
      name,
      text: 'Clique duplo para editar',
      x: 50,
      y: 220,
      width: 300,
      height: 45,
      fontSize: 14,
      fontFamily: 'Fredoka',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#64748b',
      align: 'center',
      lineHeight: 1.4,
      letterSpacing: 0,
      opacity: 100,
      shadow: false,
      stroke: false,
      strokeColor: '#ffffff',
      strokeWidth: 1,
      rotation: 0,
      visible: true,
      locked: false
    };

    setLayout(prev => {
      return {
        ...prev,
        elements: {
          ...prev.elements,
          [id]: newElement
        },
        layerOrder: [...prev.layerOrder, id]
      };
    });
    setSelectedId(id);
  };

  const deleteElement = (elementId: string) => {
    if (!elementId.startsWith('texto_')) return;
    setLayout(prev => {
      const elements = { ...prev.elements };
      delete elements[elementId];
      const layerOrder = prev.layerOrder.filter(id => id !== elementId);
      return {
        ...prev,
        elements,
        layerOrder
      };
    });
    setSelectedId(null);
  };

  // Save changes to database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // First, upsert wallpaper and overlay settings if modified
      const updates = [
        { key: 'invitation_bg_url', value: bgUrl },
        { key: 'bg_overlay_opacity', value: String(bgOpacity) },
        { key: 'editor_layout', value: JSON.stringify(layout) }
      ];

      const { error } = await supabase
        .from('event_settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;
      await onSave(JSON.stringify(layout));
      alert('Configurações salvas com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar as configurações no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
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

      setBgUrl(publicUrl);
    } catch (error: any) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="editor-container">
      {/* Editor Header */}
      <header className="editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="editor-btn editor-btn-secondary" onClick={onClose}>
            <ArrowLeft size={16} /> Painel
          </button>
          <span className="editor-header-title">Editor Visual WYSIWYG</span>
        </div>

        {/* Viewport controls */}
        <div className="editor-header-actions">
          <div className="prop-btn-group" style={{ marginRight: '10px' }}>
            <button 
              className={`editor-btn editor-btn-secondary ${previewMode === 'desktop' ? 'editor-btn-active' : ''}`} 
              onClick={() => setPreviewMode('desktop')}
              title="Visualização Desktop"
            >
              <Monitor size={16} /> Desktop
            </button>
            <button 
              className={`editor-btn editor-btn-secondary ${previewMode === 'mobile' ? 'editor-btn-active' : ''}`} 
              onClick={() => setPreviewMode('mobile')}
              title="Visualização Mobile"
            >
              <Smartphone size={16} /> Mobile
            </button>
          </div>
          <button className="editor-btn editor-btn-primary" onClick={handleSave} disabled={isSaving}>
            <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Convite'}
          </button>
        </div>
      </header>

      {/* Editor Main Work Area */}
      <div className="editor-main">
        {/* Left Sidebar: Tabs (Layers / Background) */}
        <aside className="editor-sidebar">
          <div className="editor-sidebar-tabs">
            <div 
              className={`editor-sidebar-tab ${activeTab === 'layers' ? 'active' : ''}`}
              onClick={() => setActiveTab('layers')}
            >
              <LayersIcon size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              Camadas
            </div>
            <div 
              className={`editor-sidebar-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <Sparkles size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              Fundo & Links
            </div>
          </div>

          <div className="editor-sidebar-content">
            {activeTab === 'layers' && (
              <div>
                <button 
                  className="editor-btn editor-btn-primary" 
                  onClick={addNewTextElement}
                  style={{ width: '100%', marginBottom: '15px', justifyContent: 'center', gap: '8px' }}
                >
                  <Plus size={16} /> Adicionar Novo Texto
                </button>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#ffeb95' }}>Ordem das Camadas</h3>
                {/* Render layers in reverse order so topmost layers are shown first */}
                {[...layout.layerOrder].reverse().map((elementId) => {
                  const element = layout.elements[elementId];
                  if (!element) return null;
                  return (
                    <div 
                      key={elementId} 
                      className={`layer-item ${selectedId === elementId ? 'active' : ''}`}
                      onClick={() => setSelectedId(elementId)}
                    >
                      <div className="layer-item-info">
                        <Type size={14} />
                        <span>{element.name}</span>
                      </div>
                      <div className="layer-item-actions" onClick={(e) => e.stopPropagation()}>
                        {/* Excluir (apenas para textos customizados) */}
                        {elementId.startsWith('texto_') && (
                          <button 
                            className="layer-btn"
                            onClick={() => deleteElement(elementId)}
                            title="Excluir camada de texto"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        {/* Lock toggle */}
                        <button 
                          className={`layer-btn ${element.locked ? 'active' : ''}`}
                          onClick={() => updateSelectedProperty('locked', !element.locked)}
                          title={element.locked ? 'Desbloquear camada' : 'Bloquear camada'}
                        >
                          {element.locked ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                        {/* Visibility toggle */}
                        <button 
                          className={`layer-btn ${!element.visible ? 'active' : ''}`}
                          onClick={() => updateSelectedProperty('visible', !element.visible)}
                          title={element.visible ? 'Ocultar camada' : 'Exibir camada'}
                        >
                          {element.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        {/* Order buttons */}
                        <button 
                          className="layer-btn" 
                          onClick={() => moveLayer('up', elementId)}
                          disabled={layout.layerOrder.indexOf(elementId) === layout.layerOrder.length - 1}
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button 
                          className="layer-btn" 
                          onClick={() => moveLayer('down', elementId)}
                          disabled={layout.layerOrder.indexOf(elementId) === 0}
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="prop-control">
                  <label className="prop-label">Wallpaper URL</label>
                  <input 
                    type="text" 
                    className="prop-input" 
                    value={bgUrl} 
                    onChange={(e) => setBgUrl(e.target.value)} 
                    placeholder="URL da Imagem"
                  />
                </div>
                <div className="prop-control">
                  <label className="prop-label">Fazer Upload de Fundo</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    style={{ fontSize: '0.8rem', color: '#94a3b8' }}
                  />
                </div>
                <div className="prop-control">
                  <label className="prop-label">Opacidade Escurecedora ({bgOpacity}%)</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={bgOpacity} 
                    onChange={(e) => setBgOpacity(Number(e.target.value))} 
                    style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                  />
                </div>
                <div className="prop-control">
                  <label className="prop-label">Link RSVP (Confirmação)</label>
                  <input 
                    type="text" 
                    className="prop-input" 
                    value={settings.rsvp_link || ''} 
                    onChange={(e) => {
                      settings.rsvp_link = e.target.value;
                    }}
                    placeholder="Link do WhatsApp"
                  />
                </div>
                <div className="prop-control">
                  <label className="prop-label">Link Maps (Localização)</label>
                  <input 
                    type="text" 
                    className="prop-input" 
                    value={settings.location_url || ''} 
                    onChange={(e) => {
                      settings.location_url = e.target.value;
                    }}
                    placeholder="Link do Google Maps"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center Workspace (Canvas) */}
        <main 
          className={`canvas-workspace ${previewMode === 'mobile' ? 'preview-mobile' : ''}`}
          onClick={handleCanvasClick}
        >
          {/* Simulated Mobile Wrapper Frame if mobile preview active */}
          <div 
            style={previewMode === 'mobile' ? {
              border: '12px solid #334155',
              borderRadius: '36px',
              padding: '10px',
              backgroundColor: '#0f172a',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            } : {}}
          >
            <div 
              ref={canvasRef}
              className="canvas-container"
              style={{
                backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Opacity Dark Overlay */}
              <div 
                className="canvas-bg-overlay"
                style={{
                  backgroundColor: `rgba(0, 0, 0, ${bgOpacity / 100})`
                }}
              />

              {/* Elements Rendering in Layer Order */}
              {layout.layerOrder.map((elementId) => {
                const element = layout.elements[elementId];
                if (!element.visible) return null;

                const isSelected = selectedId === elementId;
                
                // Style configurations
                const elementStyle: React.CSSProperties = {
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  fontFamily: `${element.fontFamily}, sans-serif`,
                  fontSize: `${element.fontSize}px`,
                  fontWeight: element.fontWeight,
                  fontStyle: element.fontStyle,
                  textDecoration: element.textDecoration,
                  color: element.color,
                  backgroundColor: element.backgroundColor || 'transparent',
                  justifyContent: element.align === 'center' ? 'center' : 
                                   element.align === 'right' ? 'flex-end' : 'flex-start',
                  textAlign: element.align === 'justify' ? 'justify' : 
                             element.align === 'center' ? 'center' : 
                             element.align === 'right' ? 'right' : 'left',
                  lineHeight: element.lineHeight,
                  letterSpacing: `${element.letterSpacing}px`,
                  opacity: element.opacity / 100,
                  transform: `rotate(${element.rotation}deg)`,
                  textShadow: element.shadow ? '2px 2px 4px rgba(0, 0, 0, 0.4)' : 'none',
                  WebkitTextStroke: element.stroke ? `${element.strokeWidth}px ${element.strokeColor}` : 'none',
                  borderRadius: elementId.startsWith('botao') ? '20px' : '0',
                  boxShadow: elementId.startsWith('botao') && element.shadow ? '0 4px 10px rgba(0,0,0,0.3)' : 'none',
                  padding: elementId.startsWith('botao') ? '8px 16px' : '4px'
                };

                return (
                  <div
                    key={elementId}
                    className={`canvas-element ${isSelected ? 'selected' : ''} ${element.locked ? 'locked' : ''}`}
                    style={elementStyle}
                    onMouseDown={(e) => handleActionStart(e, elementId, 'drag')}
                    onTouchStart={(e) => handleActionStart(e, elementId, 'drag')}
                    onDoubleClick={() => {
                      if (!element.locked) setIsEditingInline(true);
                    }}
                  >
                    {isEditingInline && isSelected ? (
                      <textarea
                        className="canvas-inline-input"
                        value={element.text}
                        onChange={(e) => updateSelectedProperty('text', e.target.value)}
                        onBlur={() => setIsEditingInline(false)}
                        autoFocus
                      />
                    ) : (
                      <span>{element.text}</span>
                    )}

                    {/* Resize handles */}
                    {isSelected && !element.locked && !isEditingInline && (
                      <>
                        <div 
                          className="element-handle element-handle-br" 
                          onMouseDown={(e) => handleActionStart(e, elementId, 'resize-br')}
                          onTouchStart={(e) => handleActionStart(e, elementId, 'resize-br')}
                        />
                        <div 
                          className="element-handle element-handle-bl" 
                          onMouseDown={(e) => handleActionStart(e, elementId, 'resize-bl')}
                          onTouchStart={(e) => handleActionStart(e, elementId, 'resize-bl')}
                        />
                        {/* Rotation Handle */}
                        <div 
                          className="element-rotation-handle"
                          onMouseDown={(e) => handleActionStart(e, elementId, 'rotate')}
                          onTouchStart={(e) => handleActionStart(e, elementId, 'rotate')}
                          title="Rotacionar"
                        >
                          <Sparkles size={10} color="white" />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Center Snapping Guide lines */}
              {guideV !== null && (
                <div className="guide-line guide-line-v" style={{ left: `${guideV}px` }} />
              )}
              {guideH !== null && (
                <div className="guide-line guide-line-h" style={{ top: `${guideH}px` }} />
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar: Element Settings / Properties panel */}
        <aside className="editor-properties-panel">
          {selectedElement ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#ffeb95' }}>Editar: {selectedElement.name}</h3>
                <button 
                  className="layer-btn" 
                  onClick={() => updateSelectedProperty('locked', !selectedElement.locked)}
                  title={selectedElement.locked ? 'Desbloquear elemento' : 'Bloquear elemento'}
                >
                  {selectedElement.locked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
              </div>

              {/* Text content input */}
              <div className="prop-control">
                <label className="prop-label">Texto do Elemento</label>
                <textarea
                  rows={2}
                  className="prop-input"
                  value={selectedElement.text}
                  onChange={(e) => updateSelectedProperty('text', e.target.value)}
                  disabled={selectedElement.locked}
                />
              </div>

              {/* Coordinates positioning */}
              <div className="prop-section">
                <span className="prop-section-title">Posicionamento</span>
                <div className="prop-row">
                  <div className="prop-control">
                    <label className="prop-label">Posição X</label>
                    <input 
                      type="number" 
                      className="prop-input" 
                      value={selectedElement.x} 
                      onChange={(e) => updateSelectedProperty('x', Number(e.target.value))}
                      disabled={selectedElement.locked}
                    />
                  </div>
                  <div className="prop-control">
                    <label className="prop-label">Posição Y</label>
                    <input 
                      type="number" 
                      className="prop-input" 
                      value={selectedElement.y} 
                      onChange={(e) => updateSelectedProperty('y', Number(e.target.value))}
                      disabled={selectedElement.locked}
                    />
                  </div>
                </div>
                <div className="prop-row">
                  <div className="prop-control">
                    <label className="prop-label">Largura</label>
                    <input 
                      type="number" 
                      className="prop-input" 
                      value={selectedElement.width} 
                      onChange={(e) => updateSelectedProperty('width', Number(e.target.value))}
                      disabled={selectedElement.locked}
                    />
                  </div>
                  <div className="prop-control">
                    <label className="prop-label">Altura</label>
                    <input 
                      type="number" 
                      className="prop-input" 
                      value={selectedElement.height} 
                      onChange={(e) => updateSelectedProperty('height', Number(e.target.value))}
                      disabled={selectedElement.locked}
                    />
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="prop-section">
                <span className="prop-section-title">Tipografia</span>
                <div className="prop-control">
                  <label className="prop-label">Fonte</label>
                  <select
                    className="prop-input"
                    value={selectedElement.fontFamily}
                    onChange={(e) => updateSelectedProperty('fontFamily', e.target.value)}
                    disabled={selectedElement.locked}
                    style={{ background: '#0f172a' }}
                  >
                    {DEFAULT_FONTS.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div className="prop-row" style={{ alignItems: 'end' }}>
                  <div className="prop-control">
                    <label className="prop-label">Tamanho ({selectedElement.fontSize}px)</label>
                    <input
                      type="range"
                      min="8"
                      max="72"
                      value={selectedElement.fontSize}
                      onChange={(e) => updateSelectedProperty('fontSize', Number(e.target.value))}
                      disabled={selectedElement.locked}
                      style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                    />
                  </div>
                  <div className="prop-control">
                    <label className="prop-label">Cor</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="color"
                        value={selectedElement.color}
                        onChange={(e) => updateSelectedProperty('color', e.target.value)}
                        disabled={selectedElement.locked}
                        style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        className="prop-input"
                        value={selectedElement.color}
                        onChange={(e) => updateSelectedProperty('color', e.target.value)}
                        disabled={selectedElement.locked}
                        style={{ padding: '4px', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Text Styles & Alignments */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                  <div className="prop-btn-group" style={{ flex: 1 }}>
                    <button
                      className={`prop-btn ${selectedElement.fontWeight === 'bold' ? 'active' : ''}`}
                      onClick={() => updateSelectedProperty('fontWeight', selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                      disabled={selectedElement.locked}
                    >
                      <Bold size={14} style={{ margin: '0 auto' }} />
                    </button>
                    <button
                      className={`prop-btn ${selectedElement.fontStyle === 'italic' ? 'active' : ''}`}
                      onClick={() => updateSelectedProperty('fontStyle', selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')}
                      disabled={selectedElement.locked}
                    >
                      <Italic size={14} style={{ margin: '0 auto' }} />
                    </button>
                    <button
                      className={`prop-btn ${selectedElement.textDecoration === 'underline' ? 'active' : ''}`}
                      onClick={() => updateSelectedProperty('textDecoration', selectedElement.textDecoration === 'underline' ? 'none' : 'underline')}
                      disabled={selectedElement.locked}
                    >
                      <Underline size={14} style={{ margin: '0 auto' }} />
                    </button>
                  </div>

                  <div className="prop-btn-group" style={{ flex: 1.2 }}>
                    <button
                      className={`prop-btn ${selectedElement.align === 'left' ? 'active' : ''}`}
                      onClick={() => updateSelectedProperty('align', 'left')}
                      disabled={selectedElement.locked}
                    >
                      <AlignLeft size={14} style={{ margin: '0 auto' }} />
                    </button>
                    <button
                      className={`prop-btn ${selectedElement.align === 'center' ? 'active' : ''}`}
                      onClick={() => updateSelectedProperty('align', 'center')}
                      disabled={selectedElement.locked}
                    >
                      <AlignCenter size={14} style={{ margin: '0 auto' }} />
                    </button>
                    <button
                      className={`prop-btn ${selectedElement.align === 'right' ? 'active' : ''}`}
                      onClick={() => updateSelectedProperty('align', 'right')}
                      disabled={selectedElement.locked}
                    >
                      <AlignRight size={14} style={{ margin: '0 auto' }} />
                    </button>
                    <button
                      className={`prop-btn ${selectedElement.align === 'justify' ? 'active' : ''}`}
                      onClick={() => updateSelectedProperty('align', 'justify')}
                      disabled={selectedElement.locked}
                    >
                      <AlignJustify size={14} style={{ margin: '0 auto' }} />
                    </button>
                  </div>
                </div>

                <div className="prop-row">
                  <div className="prop-control">
                    <label className="prop-label">Espaçamento Linha</label>
                    <input
                      type="range"
                      min="0.8"
                      max="2.5"
                      step="0.1"
                      value={selectedElement.lineHeight}
                      onChange={(e) => updateSelectedProperty('lineHeight', Number(e.target.value))}
                      disabled={selectedElement.locked}
                      style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                    />
                  </div>
                  <div className="prop-control">
                    <label className="prop-label">Espaçamento Letras</label>
                    <input
                      type="range"
                      min="-2"
                      max="10"
                      step="0.5"
                      value={selectedElement.letterSpacing}
                      onChange={(e) => updateSelectedProperty('letterSpacing', Number(e.target.value))}
                      disabled={selectedElement.locked}
                      style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                    />
                  </div>
                </div>
              </div>

              {/* Advanced effects */}
              <div className="prop-section">
                <span className="prop-section-title">Efeitos & Rotação</span>
                
                <div className="prop-row">
                  <div className="prop-control">
                    <label className="prop-label">Opacidade ({selectedElement.opacity}%)</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={selectedElement.opacity}
                      onChange={(e) => updateSelectedProperty('opacity', Number(e.target.value))}
                      disabled={selectedElement.locked}
                      style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                    />
                  </div>
                  <div className="prop-control">
                    <label className="prop-label">Rotação ({selectedElement.rotation}°)</label>
                    <input
                      type="range"
                      min="0"
                      max="359"
                      value={selectedElement.rotation}
                      onChange={(e) => updateSelectedProperty('rotation', Number(e.target.value))}
                      disabled={selectedElement.locked}
                      style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                    />
                  </div>
                </div>

                <div className="prop-row" style={{ marginTop: '10px' }}>
                  <div className="prop-control">
                    <label className="prop-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedElement.shadow} 
                        onChange={(e) => updateSelectedProperty('shadow', e.target.checked)}
                        disabled={selectedElement.locked}
                      /> Sombra Projetada
                    </label>
                  </div>
                </div>

                {/* Custom button background color if it is a button */}
                {selectedElement.id.startsWith('botao') && (
                  <>
                    <div className="prop-control" style={{ marginTop: '10px' }}>
                      <label className="prop-label">Cor de Fundo do Botão</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                          type="color"
                          value={selectedElement.backgroundColor || '#2563eb'}
                          onChange={(e) => updateSelectedProperty('backgroundColor', e.target.value)}
                          disabled={selectedElement.locked}
                          style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          className="prop-input"
                          value={selectedElement.backgroundColor || '#2563eb'}
                          onChange={(e) => updateSelectedProperty('backgroundColor', e.target.value)}
                          disabled={selectedElement.locked}
                          style={{ padding: '4px', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>
                    <div className="prop-control" style={{ marginTop: '10px', borderTop: '1px dashed #334155', paddingTop: '10px' }}>
                      <label className="prop-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedElement.visible} 
                          onChange={(e) => updateSelectedProperty('visible', e.target.checked)}
                          disabled={selectedElement.locked}
                        /> Exibir botão dentro do convite
                      </label>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                        Se desativado, o botão aparecerá no rodapé externo do convite.
                      </p>
                    </div>
                  </>
                )}

                {/* Contour / Stroke settings */}
                <div style={{ marginTop: '10px', borderTop: '1px dashed #334155', paddingTop: '10px' }}>
                  <label className="prop-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedElement.stroke} 
                      onChange={(e) => updateSelectedProperty('stroke', e.target.checked)}
                      disabled={selectedElement.locked}
                    /> Ativar Contorno (Stroke)
                  </label>
                  {selectedElement.stroke && (
                    <div className="prop-row">
                      <div className="prop-control">
                        <label className="prop-label">Espessura ({selectedElement.strokeWidth}px)</label>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          value={selectedElement.strokeWidth}
                          onChange={(e) => updateSelectedProperty('strokeWidth', Number(e.target.value))}
                          disabled={selectedElement.locked}
                          style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                        />
                      </div>
                      <div className="prop-control">
                        <label className="prop-label">Cor do Contorno</label>
                        <input
                          type="color"
                          value={selectedElement.strokeColor}
                          onChange={(e) => updateSelectedProperty('strokeColor', e.target.value)}
                          disabled={selectedElement.locked}
                          style={{ width: '100%', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5, textAlign: 'center' }}>
              <Sliders size={48} style={{ marginBottom: '15px' }} />
              <p style={{ fontSize: '0.85rem' }}>Selecione um elemento na tela ou na aba de Camadas para editá-lo.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
