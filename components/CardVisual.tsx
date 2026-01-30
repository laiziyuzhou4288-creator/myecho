import React from 'react';

interface CardVisualProps {
  imageUrl?: string;
  isRevealed: boolean;
  onClick?: () => void;
  className?: string;
  glowing?: boolean;
}

const CardVisual: React.FC<CardVisualProps> = ({ imageUrl, isRevealed, onClick, className = '', glowing = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative w-48 h-80 perspective-1000 cursor-pointer transition-transform duration-500 hover:scale-105 ${className}`}
    >
      <div 
        className={`w-full h-full relative transition-all duration-700 preserve-3d ${isRevealed ? 'rotate-y-180' : ''}`} 
        style={{ transformStyle: 'preserve-3d', transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Back of Card */}
        <div 
          className="absolute w-full h-full backface-hidden rounded-xl shadow-2xl overflow-hidden border border-white/10"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
             {/* Simple Pattern */}
             <div className="w-40 h-72 border-2 border-white/20 rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                </div>
             </div>
          </div>
          {glowing && (
            <div className="absolute inset-0 bg-indigo-500/20 animate-pulse-slow z-10"></div>
          )}
        </div>

        {/* Front of Card */}
        <div 
          className="absolute w-full h-full backface-hidden rounded-xl shadow-2xl overflow-hidden border border-white/10 bg-slate-800"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {imageUrl && (
            <img src={imageUrl} alt="Tarot Card" className="w-full h-full object-cover opacity-90" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default CardVisual;
