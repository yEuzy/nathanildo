import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift as GiftIcon } from "lucide-react";

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

  const vipNames = ["Kallewfel", "MriaRta"]; // Substitua pelos nomes desejados

  const conviteImageUrl = ""; // Placeholder vazio para a div azul

  const particles = Array.from({ length: 12 });

  useEffect(() => {
    setIsReady(true);
    let ignore = false;

    // Check localStorage
    const savedName = localStorage.getItem("guestName");

    if (savedName) {
      setGuestName(savedName);
      // Se já tem nome, pula o envelope E abre o convite grande
      setIsOpen(true);
      setIsDetailedView(true);
    } else {
      setIsNameModalOpen(true);
    }

    const loadGifts = async () => {
      const { data } = await supabase.from("gifts").select("*").order("name");
      if (!ignore && data) {
        setGifts(data);
      }
    };

    loadGifts();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSaveName = (name: string) => {
    setGuestName(name);
    localStorage.setItem("guestName", name);
    setIsNameModalOpen(false);
  };

  const showGifts = () => {
    setIsDetailedView(false);
    setTimeout(() => {
      setIsGiftsModalOpen(true);
    }, 100);
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

      <Envelope isOpen={isOpen} onClick={handleOpenEnvelope} guestName={guestName}>
        <Convite
          isOpen={isOpen}
          isDetailedView={isDetailedView}
          onOpenDetail={() => setIsDetailedView(true)}
          imageUrl={conviteImageUrl}
        />
      </Envelope>

      {!isOpen && <div className="hint-text">Toque no envelope para abrir</div>}

      {isOpen && !isDetailedView && (
        <motion.div
          className="hint-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2 }}
        >
          Toque no convite para ampliar
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
            {vipNames.includes(guestName) && (
              <button
                className="vip-admin-card-btn"
                onClick={() => navigate("/admin-presentes")}
                title="Gerenciar Presentes"
              >
                <GiftIcon size={20} />
              </button>
            )}

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
                  <span>
                    DETALHES DO
                    <br />
                    CONVITE
                  </span>
                )}
              </div>

              <div className="action-buttons-modal">
                <button
                  className="action-btn"
                  onClick={() => alert("Confirmado!")}
                >
                  <img src="/001.png" alt="RSVP" className="btn-icon" />
                  <span>RSVP</span>
                </button>
                <button
                  className="action-btn"
                  onClick={() => alert("Abrindo mapa...")}
                >
                  <img src="/025.png" alt="Local" className="btn-icon" />
                  <span>Local</span>
                </button>
                <button className="action-btn" onClick={showGifts}>
                  <img src="/028.png" alt="Dicas" className="btn-icon" />
                  <span>Dicas</span>
                </button>
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
            style={{ zIndex: 200 }}
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
                }}
              >
                Dicas de Presentes
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
              <h2
                style={{
                  color: "#1e40af",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                Bem-vindo!
              </h2>
              <p style={{ textAlign: "center", marginBottom: "20px" }}>
                Como devemos te chamar?
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
