import React from 'react';
import { motion } from 'framer-motion';

interface ConviteProps {
  isOpen: boolean;
  isDetailedView: boolean;
  onOpenDetail: () => void;
  imageUrl?: string;
}

export const Convite: React.FC<ConviteProps> = ({ 
  isOpen, 
  isDetailedView, 
  onOpenDetail, 
  imageUrl 
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
        <span>SEU CONVITE<br/>AQUI</span>
      )}
    </motion.div>
  );
};
