import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
  editorLayout?: string;
  guestName?: string;
  invitationAlignment?: string;
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
  bgOverlayOpacity,
  editorLayout,
  guestName,
  invitationAlignment = 'center'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const scale = containerWidth / 400;

  let parsedLayout: EditorLayout | null = null;
  if (editorLayout) {
    try {
      parsedLayout = JSON.parse(editorLayout);
    } catch (e) {
      console.error('Erro ao processar layout no Convite:', e);
    }
  }

  const getAlignmentStyle = (align: string): React.CSSProperties => {
    if (align === 'space-between') {
      return {
        textAlign: 'justify',
        textAlignLast: 'justify'
      };
    }
    return {
      textAlign: align as any
    };
  };

  return (
    <motion.div
      layoutId="invitation-card"
      className={`modal-card-display ${!imageUrl ? 'text-only' : ''}`}
      initial={{ y: 0, opacity: 0, scale: 0.4 }}
      animate={{ 
        y: isOpen ? "-35dvh" : 0, 
        opacity: isOpen ? 1 : 0,
        scale: isOpen ? 0.7 : 0.4,
      }}
      transition={{ 
        duration: 0.9, 
        ease: [0.175, 0.885, 0.32, 1.275],
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
      {parsedLayout ? (
        <div 
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '400px',
              height: '500px',
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              pointerEvents: 'none'
            }}
          >
            {parsedLayout.layerOrder.map((elementId) => {
              const element = parsedLayout!.elements[elementId];
              if (!element || !element.visible) return null;

              let text = element.text;
              if (elementId === 'titulo' && guestName) {
                text = guestName;
              }

              const alignStyle = getAlignmentStyle(element.align);

              const elementStyle: React.CSSProperties = {
                position: 'absolute',
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: element.align === 'center' ? 'center' : 
                                 element.align === 'right' ? 'flex-end' : 'flex-start',
                ...alignStyle,
                lineHeight: element.lineHeight,
                letterSpacing: `${element.letterSpacing}px`,
                opacity: element.opacity / 100,
                transform: `rotate(${element.rotation}deg)`,
                textShadow: element.shadow ? '2px 2px 4px rgba(0, 0, 0, 0.4)' : 'none',
                WebkitTextStroke: element.stroke ? `${element.strokeWidth}px ${element.strokeColor}` : 'none',
                borderRadius: elementId.startsWith('botao') ? '20px' : '0',
                boxShadow: elementId.startsWith('botao') && element.shadow ? '0 4px 10px rgba(0,0,0,0.3)' : 'none',
                padding: elementId.startsWith('botao') ? '8px 16px' : '4px',
                boxSizing: 'border-box'
              };

              return (
                <div key={elementId} style={elementStyle}>
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div 
          className="modal-card-text-content"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${Number(bgOverlayOpacity || 0) / 100})`,
            textAlign: invitationAlignment as any
          }}
        >
          <h1 className={title === 'carregando...' ? 'loading' : ''} style={{
            color: titleColor,
            textAlign: invitationAlignment as any
          }}>
            {title || 'carregando...'}
          </h1>
          <p className={title === 'carregando...' ? 'loading' : ''} style={{
            color: bodyColor,
            textAlign: invitationAlignment as any
          }}>
            {body || '...'}
          </p>
        </div>
      )}
    </motion.div>
  );
};
