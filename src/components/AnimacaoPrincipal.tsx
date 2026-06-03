import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift as GiftIcon, Heart } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { Envelope } from "./Envelope";
import { Convite } from "./Convite";
import { supabase } from "../lib/supabase";
import type { Gift } from "../types";

export const AnimacaoPrincipal: React.FC = () => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailedView, setIsDetailedView] = useState(false);
  const [isGiftsModalOpen, setIsGiftsModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [settings, setSettings] = useState({
    invitation_title: 'carregando...',
    invitation_body: '...',
    location_url: '#',
    rsvp_link: '#',
    invitation_bg_url: '',
    invitation_title_color: '',
    invitation_body_color: '',
    show_gifts_btn: 'true',
    bg_overlay_opacity: '0'
  });

  const [introStage, setIntroStage] = useState<'idle' | 'book-closed' | 'book-opening' | 'envelope-rising' | 'finished'>('idle');

  const vipNames = ["Kallewfel", "Mrita", "AlineBelo"]; // Substitua pelos nomes desejados


  const particles = Array.from({ length: 12 });

  const triggerIntroSequence = () => {
    setIntroStage('book-closed');
    // Inicia sequência cinematográfica
    // O livro aparece e fica 3 segundos fechado antes de começar a abrir
    setTimeout(() => setIntroStage('book-opening'), 3000);
    setTimeout(() => setIntroSequenceStageEnvelopeRising(), 4500);
    setTimeout(() => setIntroSequenceStageFinished(), 6500);
  };

  // Helper functions for timeouts to avoid stale state if needed, 
  // but since these are simple state setters, it's fine.
  // Actually, I'll just keep it simple as before but move it.

  const setIntroSequenceStageEnvelopeRising = () => setIntroStage('envelope-rising');
  const setIntroSequenceStageFinished = () => {
    setIntroStage('finished');
    handleOpenEnvelope();
  };

  const handleSaveName = (name: string) => {
    setGuestName(name);
    localStorage.setItem("guestName", name);
    setIsNameModalOpen(false);
    triggerIntroSequence();
  };

  useEffect(() => {
    setIsReady(true);
    let ignore = false;

    const urlParams = new URLSearchParams(window.location.search);
    const urlName = urlParams.get("name") || urlParams.get("guest");
    const savedName = localStorage.getItem("guestName");

    if (urlName) {
      setGuestName(urlName);
      localStorage.setItem("guestName", urlName);
      triggerIntroSequence();
    } else if (savedName) {
      setGuestName(savedName);
      triggerIntroSequence();
    } else {
      const defaultName = "Convidado";
      setGuestName(defaultName);
      localStorage.setItem("guestName", defaultName);
      triggerIntroSequence();
    }

    const loadData = async () => {
      // Load Gifts
      const { data: giftsData } = await supabase.from("gifts").select("*").order("name");

      // Load Settings
      const { data: settingsData } = await supabase.from("event_settings").select("*");

      if (!ignore) {
        if (giftsData) setGifts(giftsData);
        if (settingsData) {
          const s: any = {};
          settingsData.forEach(item => {
            s[item.key] = item.value;
          });
          setSettings(prev => ({ ...prev, ...s }));
        }
      }
    };

    const fetchGifts = async () => {
      const { data } = await supabase.from("gifts").select("*").order("name");
      if (!ignore && data) setGifts(data);
    };

    loadData();

    // Subscribe to realtime database changes for guest view
    const giftsChannel = supabase
      .channel('gifts-realtime-client')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gifts' },
        () => {
          fetchGifts();
        }
      )
      .subscribe();

    const settingsChannel = supabase
      .channel('settings-realtime-client')
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
  }, []);

  const showGifts = () => {
    setIsGiftsModalOpen(true);
  };

  const handleOpenEnvelope = () => {
    if (isOpen) return;
    setIsOpen(true);
    localStorage.setItem("invitationOpened", "true");

    // Confetes disparados quando o convite atinge o ápice
    setTimeout(() => {
      triggerConfetti();
    }, 1000);

    // Abre a visualização detalhada automaticamente após o convite subir
    setTimeout(() => {
      setIsDetailedView(true);
    }, 1600); // Sincronizado com o tempo de subida (0.4s delay + 0.9s duration + margem)
  };

  const triggerConfetti = () => {
    const end = Date.now() + 2000;
    const colors = ["#ff9a9e", "#fecfef", "#a1c4fd"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  if (!isReady) return null;

  return (
    <div className="app-container">
      {/* Partículas de Background */}
      <div className="particles-bg">
        {particles.map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              backgroundColor: ["#ff9a9e", "#fecfef", "#a1c4fd"][
                Math.floor(Math.random() * 3)
              ],
              animationDuration: `${Math.random() * 8 + 6}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Animação do Livro */}
      <AnimatePresence>
        {introStage !== 'finished' && introStage !== 'idle' && (
          <div className="book-container">
            <motion.div
              className="book"
              initial={{ x: 0, opacity: 0, scale: 0.8 }}
              animate={{ 
                x: introStage === 'envelope-rising' ? -300 : 0, 
                opacity: introStage === 'envelope-rising' ? 0 : 1,
                scale: introStage === 'envelope-rising' ? 0.8 : 1
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <motion.div 
                className="book-cover"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: introStage === 'book-closed' ? 0 : -160 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                <img src="/capa-livro.png" alt="Capa" />
              </motion.div>

              {/* Camadas de Páginas Extras - Alternando Imagens */}
              {[1, 2, 3, 4, 5, 6].map((i) => {
                const imgSrc = i === 1 ? '/outras-paginas.png' : 
                               i === 2 ? '/outras-paginas2.png' : 
                               i === 3 ? '/outras-paginas3.png' :
                               i === 4 ? '/outras-paginas.png' :
                               i === 5 ? '/outras-paginas2.png' : '/outras-paginas3.png';
                
                return (
                  <motion.div
                    key={i}
                    className="book-page-layer"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: introStage === 'book-closed' ? 0 : -158 + (i * 3) }}
                    transition={{ duration: 1.5 + (i * 0.08), ease: "easeInOut", delay: 0.05 * i }}
                  >
                    <img src={imgSrc} alt={`Página ${i}`} />
                  </motion.div>
                );
              })}

              <div className="book-page">
                <img src="/pagina-livro.png" alt="Página" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Esconde o envelope e as dicas quando o convite grande está aberto */}
      {!isDetailedView && (introStage === 'envelope-rising' || introStage === 'finished') && (
        <motion.div
          className="envelope-intro-wrapper"
          initial={introStage === 'envelope-rising' ? {
            scale: 0.15,
            rotate: -25,
            y: 50,
            x: 20,
            opacity: 0
          } : { scale: 1, rotate: 0, y: 0, x: 0, opacity: 1 }}
          animate={{
            scale: 1,
            rotate: 0,
            y: 0,
            x: 0,
            opacity: 1
          }}
          transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
          style={{ 
            zIndex: 100, 
            position: 'relative' 
          }}
        >
          <Envelope isOpen={isOpen} onClick={handleOpenEnvelope} guestName={guestName}>
            <Convite
              isOpen={isOpen}
              isDetailedView={isDetailedView}
              onOpenDetail={() => setIsDetailedView(true)}
              imageUrl={settings.invitation_bg_url}
              title={guestName || settings.invitation_title}
              body={settings.invitation_body}
              titleColor={settings.invitation_title_color}
              bodyColor={settings.invitation_body_color}
              bgOverlayOpacity={settings.bg_overlay_opacity}
            />
          </Envelope>

          {!isOpen && introStage === 'finished' && <div className="hint-text">Toque no envelope para abrir</div>}
        </motion.div>
      )}

      {/* Visualização Detalhada (Modal) */}
      <AnimatePresence>
        {isDetailedView && (
          <motion.div
            key="details-modal"
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (localStorage.getItem("invitationOpened") !== "true") {
                setIsDetailedView(false);
              }
            }}
          >
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              {localStorage.getItem("invitationOpened") !== "true" && (
                <motion.button
                  className="close-modal"
                  onClick={() => setIsDetailedView(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <X size={24} />
                </motion.button>
              )}

              {/* Botão VIP dentro do convite ampliado */}

              <motion.div 
                layoutId="invitation-card"
                className={`modal-card-display ${!settings.invitation_bg_url ? 'text-only' : ''}`}
                style={settings.invitation_bg_url ? {
                  backgroundImage: `url(${settings.invitation_bg_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                } : {}}
              >
                <div 
                  className="modal-card-text-content"
                  style={{
                    backgroundColor: `rgba(0, 0, 0, ${Number(settings.bg_overlay_opacity || 0) / 100})`
                  }}
                >
                  <h1 className={(!guestName && settings.invitation_title === 'carregando...') ? 'loading' : ''} style={settings.invitation_title_color ? { color: settings.invitation_title_color } : {}}>
                    {guestName || settings.invitation_title}
                  </h1>
                  <p className={settings.invitation_body === '...' ? 'loading' : ''} style={settings.invitation_body_color ? { color: settings.invitation_body_color } : {}}>
                    {settings.invitation_body}
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="action-buttons-modal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <button
                  className="action-btn"
                  onClick={() => {
                    const message = encodeURIComponent(`Olá, sou ${guestName} gostaria de confirmar minha presença na festa do Nathan!`);
                    const finalLink = settings.rsvp_link.includes('?')
                      ? `${settings.rsvp_link}&text=${message}`
                      : `${settings.rsvp_link}?text=${message}`;
                    window.open(finalLink, '_blank');
                  }}
                >
                  <img src="/001.png" alt="RSVP" className="btn-icon" />
                  <span>Confirmar</span>
                </button>
                <button
                  className="action-btn"
                  onClick={() => window.open(settings.location_url, '_blank')}
                >
                  <img src="/025.png" alt="Local" className="btn-icon" />
                  <span>Local</span>
                </button>
                {settings.show_gifts_btn !== 'false' && (
                  <button className="action-btn" onClick={showGifts}>
                    <img src="/028.png" alt="Dicas" className="btn-icon" />
                    <span>Dicas</span>
                  </button>
                )}
                {vipNames.includes(guestName) && (
                  <button
                    className="action-btn admin-btn-special"
                    onClick={() => navigate("/admin-presentes")}
                  >
                    <GiftIcon className="btn-icon" />
                    <span>Admin</span>
                  </button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        {/* Modal de Dicas de Presentes */}
        {isGiftsModalOpen && (
          <motion.div
            key="gifts-modal"
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsGiftsModalOpen(false)}
            style={{ zIndex: 2000 }}
          >
            <motion.div
              className="modal-content gifts-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close-modal"
                onClick={() => setIsGiftsModalOpen(false)}
              >
                <X size={24} />
              </button>

              <h2
                style={{
                  color: "#1e40af",
                  marginBottom: "20px",
                  textAlign: "center",
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: "2.2rem"
                }}
              >
                Sugestões de Presentes
              </h2>

              <div className="gifts-list-container">
                {gifts.length > 0 ? (
                  <div className="gifts-scroll">
                    {gifts.map((gift) => (
                      <div key={gift.id} className="gift-item-card">
                        <div className="gift-info">
                          <span className="gift-name">{gift.name}</span>
                          {gift.price && (
                            <span className="gift-price">{gift.price}</span>
                          )}
                        </div>
                        {gift.link && (
                          <a
                            href={gift.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gift-link-btn"
                          >
                            Ver sugestão
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: "center", opacity: 0.6 }}>
                    Nenhuma sugestão cadastrada ainda.
                  </p>
                )}
              </div>

              <p
                style={{
                  fontSize: "0.8rem",
                  textAlign: "center",
                  marginTop: "20px",
                  opacity: 0.7,
                }}
              >
                Sua presença é o nosso maior presente!
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Modal de Perguntar Nome */}
        {isNameModalOpen && (
          <motion.div
            key="name-modal"
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 300 }}
          >
            <motion.div
              className="modal-content name-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                <Heart size={40} fill="#ff9a9e" color="#ff9a9e" style={{ opacity: 0.8 }} />
              </div>
              <h2
                style={{
                  color: "#1e40af",
                  marginBottom: "10px",
                  textAlign: "center",
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: "2rem"
                }}
              >
                Bem-vindo!
              </h2>
              <p style={{ textAlign: "center", marginBottom: "25px", color: "#64748b" }}>
                Para começar, como devemos te chamar?
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = (e.currentTarget.elements[0] as HTMLInputElement)
                    .value;
                  if (name.trim()) handleSaveName(name);
                }}
              >
                <input
                  type="text"
                  placeholder="Seu nome"
                  required
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "2px solid #e2e8f0",
                    marginBottom: "15px",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Entrar
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
