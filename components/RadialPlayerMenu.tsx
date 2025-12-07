import React, { useEffect, useState } from 'react';
import { Player } from '../types';

interface RadialPlayerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  x: number;
  y: number;
  players: Player[];
  onSelect: (player: Player) => void;
  title?: string;
}

export const RadialPlayerMenu: React.FC<RadialPlayerMenuProps> = ({
  isOpen,
  onClose,
  x,
  y,
  players,
  onSelect,
  title
}) => {
  const [visible, setVisible] = useState(false);
  const [adjustedPos, setAdjustedPos] = useState({ x, y });

  useEffect(() => {
    if (isOpen) {
      // Calculate layout safety margins
      const radius = 110;
      const itemRadius = 50; // Half of item width + margin
      const padding = 15; // Screen edge padding
      const sideMargin = radius + itemRadius + padding;

      const winW = window.innerWidth;
      const winH = window.innerHeight;

      // Clamp X position
      // If screen is too narrow, center it
      let newX = x;
      if (winW > sideMargin * 2) {
         newX = Math.max(sideMargin, Math.min(x, winW - sideMargin));
      } else {
         newX = winW / 2;
      }

      // Clamp Y position
      // Account for title at top (-160px relative to center)
      const topSpace = title ? (160 + padding) : sideMargin;
      const bottomSpace = sideMargin;

      let newY = y;
      if (winH > topSpace + bottomSpace) {
         newY = Math.max(topSpace, Math.min(y, winH - bottomSpace));
      } else {
         newY = winH / 2;
      }

      setAdjustedPos({ x: newX, y: newY });

      // Small delay to allow mounting before animating in
      const timer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOpen, x, y, title]);

  if (!isOpen) return null;

  // Constants for layout
  const radius = 110; 
  const count = players.length;
  const startAngle = -90; 
  const arc = 360;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };
  
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu Container */}
      <div 
        className="fixed z-50 pointer-events-none transition-all duration-300 ease-out"
        style={{ left: adjustedPos.x, top: adjustedPos.y }}
      >
        {/* Central Label/Title */}
        {title && (
             <div className={`absolute top-[-160px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/75 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide pointer-events-auto transition-all duration-300 shadow-xl ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                 {title.toUpperCase()}
             </div>
        )}

        {/* Players */}
        {players.map((player, index) => {
          const angleDeg = startAngle + (index * (arc / count));
          const angleRad = (angleDeg * Math.PI) / 180;
          
          // Calculate relative position from center
          const finalX = Math.cos(angleRad) * radius;
          const finalY = Math.sin(angleRad) * radius;
          const delay = index * 30;

          return (
            <button
              key={player.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(player);
              }}
              className="absolute flex flex-col items-center justify-center pointer-events-auto group transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
              style={{
                // Center the button (which is ~60px wide) on the calculated point
                transform: visible 
                  ? `translate(${finalX - 30}px, ${finalY - 40}px) scale(1)` 
                  : `translate(-30px, -40px) scale(0)`,
                opacity: visible ? 1 : 0,
                transitionDelay: `${visible ? delay : 0}ms`,
                width: 60,
              }}
            >
              {/* Avatar Circle */}
              <div className="relative mb-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-300 shadow-lg border-2 border-white flex items-center justify-center group-active:scale-95 transition-transform duration-200 overflow-hidden">
                    <span className="text-sm font-bold text-slate-600">{getInitials(player.name)}</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md z-10">
                    {player.number}
                </div>
              </div>

              {/* Name Label */}
              <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-white/40 flex flex-col items-center min-w-[70px]">
                <span className="text-[10px] font-bold text-slate-900 leading-tight whitespace-nowrap truncate max-w-[80px]">
                  {player.name.split(' ')[0]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
};