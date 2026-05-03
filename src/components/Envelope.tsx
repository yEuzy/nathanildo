import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface EnvelopeProps {
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const Envelope: React.FC<EnvelopeProps> = ({ isOpen, onClick, children }) => {
  return (
    <motion.div 
      className="envelope-wrapper"
      onClick={!isOpen ? onClick : undefined}
      // Animação de descida para dar espaço ao convite
      animate={{ 
        y: isOpen ? "20dvh" : 0,
        scale: isOpen ? 0.9 : 1
      }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="envelope-back" />

      {/* O Convite é renderizado aqui */}
      {children}

      <div className="envelope-front">
        <div className="envelope-side-l" />
        <div className="envelope-side-r" />
        <div className="envelope-pocket" />
      </div>

      <motion.div 
        className="envelope-flap-wrapper"
        initial={false}
        animate={{ 
          rotateX: isOpen ? 180 : 0,
          zIndex: isOpen ? 1 : 5
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <div className="envelope-flap" />
        {!isOpen && (
          <div className="envelope-seal">
            <Heart size={22} fill="white" color="white" />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
