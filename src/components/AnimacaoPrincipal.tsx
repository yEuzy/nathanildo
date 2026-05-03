import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, MapPin, Gift } from 'lucide-react';

import { Envelope } from './Envelope';
import { Convite } from './Convite';

export const AnimacaoPrincipal: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailedView, setIsDetailedView] = useState(false);
  
  const conviteImageUrl = ''; // Placeholder vazio para a div azul

  const particles = Array.from({ length: 12 });

  useEffect(() => {
    setIsReady(true);
  }, []);

  const handleOpenEnvelope = () => {
    if (isOpen) return;
    setIsOpen(true);
    
    // Confetes disparados quando o convite atinge o ápice
    setTimeout(() => {
      triggerConfetti();
    }, 1000);
  };

  const triggerConfetti = () => {
    const end = Date.now() + 2000;
    const colors = ['#ff9a9e', '#fecfef', '#a1c4fd'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
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
              backgroundColor: ['#ff9a9e', '#fecfef', '#a1c4fd'][Math.floor(Math.random() * 3)],
              animationDuration: `${Math.random() * 8 + 6}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <Envelope isOpen={isOpen} onClick={handleOpenEnvelope}>
        <Convite 
          isOpen={isOpen} 
          isDetailedView={isDetailedView}
          onOpenDetail={() => setIsDetailedView(true)}
          imageUrl={conviteImageUrl}
        />
      </Envelope>

      {!isOpen && (
        <div className="hint-text">
          Toque no envelope para abrir
        </div>
      )}
      
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
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDetailedView(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-modal" onClick={() => setIsDetailedView(false)}>
                <X size={24} />
              </button>
              
              <div className="modal-card-display">
                {conviteImageUrl ? (
                  <img src={conviteImageUrl} alt="Detalhes" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                ) : (
                  <span>DETALHES DO<br/>CONVITE</span>
                )}
              </div>
              
              <div className="action-buttons-modal">
                <button className="action-btn" onClick={() => alert('Confirmado!')}>
                  <CheckCircle2 size={20} />
                  <span>RSVP</span>
                </button>
                <button className="action-btn" onClick={() => alert('Abrindo mapa...')}>
                  <MapPin size={20} />
                  <span>Local</span>
                </button>
                <button className="action-btn" onClick={() => alert('Lista de presentes...')}>
                  <Gift size={20} />
                  <span>Dicas</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
