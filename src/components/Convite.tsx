import React from 'react';
import { motion } from 'framer-motion';

interface ConviteProps {
  isOpen: boolean;
  isDetailedView: boolean;
  onOpenDetail: () => void;
  imageUrl?: string;
  title?: string;
  body?: string;
}

export const Convite: React.FC<ConviteProps> = ({ 
  isOpen, 
  isDetailedView, 
  onOpenDetail, 
  imageUrl,
  title,
  body
}) => {
  return (
    <motion.div
      className="invitation-card"
      initial={{ y: 0, opacity: 0 }}
      animate={{ 
        // Move para cima o suficiente para sair do envelope mas ficar na tela
        y: isOpen ? "-45dvh" : 0, 
        opacity: isOpen ? 1 : 0,
        scale: isOpen ? 1.1 : 0.9,
      }}
      transition={{ 
        duration: 0.9, 
        ease: [0.175, 0.885, 0.32, 1.275], // Efeito bounce elegante
        delay: isOpen ? 0.4 : 0 
      }}
      onClick={(e) => {
        if (isOpen && !isDetailedView) {
          e.stopPropagation();
          onOpenDetail();
        }
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="Convite" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
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
            fontSize: title === 'carregando...' ? '0.7rem' : '1.2rem', 
            marginBottom: '10px', 
            color: '#1e40af',
            opacity: title === 'carregando...' ? 0.4 : 1,
            marginTop: '0px'
          }}>
            {title || 'carregando...'}
          </h1>
          <p style={{ 
            fontSize: '0.65rem', 
            color: '#64748b',
            opacity: title === 'carregando...' ? 0.3 : 1,
            lineHeight: '1.4',
            maxWidth: '90%'
          }}>
            {body || '...'}
          </p>
        </div>
      )}
    </motion.div>
  );
};
