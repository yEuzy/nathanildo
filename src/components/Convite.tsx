import React from 'react';
import { motion } from 'framer-motion';

interface ConviteProps {
  isOpen: boolean;
  isDetailedView: boolean;
  onOpenDetail: () => void;
  imageUrl?: string;
  title?: string;
  body?: string;
  titleColor?: string;
  bodyColor?: string;
  bgOverlayOpacity?: string;
}

export const Convite: React.FC<ConviteProps> = ({ 
  isOpen, 
  isDetailedView, 
  onOpenDetail,
  imageUrl,
  title,
  body,
  titleColor,
  bodyColor,
  bgOverlayOpacity
}) => {
  return (
    <motion.div
      layoutId="invitation-card"
      className={`modal-card-display ${!imageUrl ? 'text-only' : ''}`}
      initial={{ y: 0, opacity: 0, scale: 0.4 }}
      animate={{ 
        // Move para cima o suficiente para sair do envelope mas ficar na tela
        y: isOpen ? "-35dvh" : 0, 
        opacity: isOpen ? 1 : 0,
        scale: isOpen ? 0.7 : 0.4,
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
      style={{
        position: 'absolute',
        top: '5%',
        left: '5%',
        width: '90%',
        margin: 0,
        zIndex: 2,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        ...(imageUrl ? {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {})
      }}
    >
      <div 
        className="modal-card-text-content"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${Number(bgOverlayOpacity || 0) / 100})`
        }}
      >
        <h1 className={title === 'carregando...' ? 'loading' : ''} style={titleColor ? { color: titleColor } : {}}>
          {title || 'carregando...'}
        </h1>
        <p className={title === 'carregando...' ? 'loading' : ''} style={bodyColor ? { color: bodyColor } : {}}>
          {body || '...'}
        </p>
      </div>
    </motion.div>
  );
};
