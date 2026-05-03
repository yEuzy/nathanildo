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
    rsvp_link: '#'
  });

  const [introStage, setIntroStage] = useState<'idle' | 'book-closed' | 'book-opening' | 'envelope-rising' | 'finished'>('idle');

  const vipNames = ["Kallewfel", "Mrita", "AlineBelo"]; // Substitua pelos nomes desejados

  const conviteImageUrl = ""; // Placeholder vazio para a div azul

  const particles = Array.from({ length: 12 });

  useEffect(() => {
    setIsReady(true);
    let ignore = false;

    // Check localStorage
    const savedName = localStorage.getItem("guestName");

    if (savedName) {
      setGuestName(savedName);
      setIntroStage('finished');
      setIsOpen(true);
      setIsDetailedView(true);
    } else {
      setIsNameModalOpen(true);
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

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSaveName = (name: string) => {
    setGuestName(name);
    localStorage.setItem("guestName", name);
    setIsNameModalOpen(false);
    setIntroStage('book-closed');

    // Inicia sequência cinematográfica
    setTimeout(() => setIntroStage('book-opening'), 1000);
    setTimeout(() => setIntroStage('envelope-rising'), 2500);
    setTimeout(() => setIntroStage('finished'), 4500);
  };

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
              initial={{ x: 0 }}
              animate={{ x: introStage === 'envelope-rising' ? -300 : 0, opacity: introStage === 'envelope-rising' ? 0 : 1 }}
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
              imageUrl={conviteImageUrl}
              title={settings.invitation_title}
              body={settings.invitation_body}
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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {localStorage.getItem("invitationOpened") !== "true" && (
                <button
                  className="close-modal"
                  onClick={() => setIsDetailedView(false)}
                >
                  <X size={24} />
                </button>
              )}

              {/* Botão VIP dentro do convite ampliado */}

              <div className="modal-card-display">
                {conviteImageUrl ? (
                  <img
                    src={conviteImageUrl}
                    alt="Detalhes"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "inherit",
                    }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    height: '100%',
                    padding: '12px 20px',
                    textAlign: 'center'
                  }}>
                    <h1 style={{
                      color: '#1e40af',
                      marginBottom: '15px',
                      fontSize: settings.invitation_title === 'carregando...' ? '0.9rem' : '2.2rem',
                      opacity: settings.invitation_title === 'carregando...' ? 0.5 : 1,
                      fontFamily: settings.invitation_title === 'carregando...' ? 'inherit' : "'Dancing Script', cursive"
                    }}>
                      {settings.invitation_title}
                    </h1>
                    <p style={{
                      color: '#64748b',
                      fontSize: '1.2rem',
                      lineHeight: '1.8',
                      opacity: settings.invitation_body === '...' ? 0.3 : 1,
                      maxWidth: '90%'
                    }}>
                      {settings.invitation_body}
                    </p>
                  </div>
                )}
              </div>

              <div className="action-buttons-modal">
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
                <button className="action-btn" onClick={showGifts}>
                  <img src="/028.png" alt="Dicas" className="btn-icon" />
                  <span>Dicas</span>
                </button>
                {vipNames.includes(guestName) && (
                  <button
                    className="action-btn admin-btn-special"
                    onClick={() => navigate("/admin-presentes")}
                  >
                    <GiftIcon className="btn-icon" />
                    <span>Admin</span>
                  </button>
                )}
              </div>
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
