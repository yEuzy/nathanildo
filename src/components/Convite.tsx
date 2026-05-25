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
      style={imageUrl ? {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {}}
    >
      <div 
        className="invitation-card-text-container"
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
