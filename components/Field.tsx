import React, { useRef, useState } from 'react';
import { Coordinate, GameEvent, EventType } from '../types';
import { FIELD_DIMENSIONS } from '../constants';

interface FieldProps {
  onTap: (coords: Coordinate) => void;
  events: GameEvent[];
  lastLocation: Coordinate | null;
  orientation: 'vertical' | 'horizontal'; // Mobile usually vertical
}

export const Field: React.FC<FieldProps> = ({ onTap, events, lastLocation, orientation = 'vertical' }) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (!fieldRef.current) return;
    
    // Prevent default to stop scrolling on mobile taps
    // e.preventDefault(); // Note: careful with this on some devices

    const rect = fieldRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Calculate percentage relative to the field container
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    onTap({ x, y });
  };

  // Convert percentages to CSS
  const getStyle = (coords: Coordinate) => ({
    left: `${coords.x}%`,
    top: `${coords.y}%`,
  });

  // Calculate endzone split percentage (standard field is 110 yards total, 20 yard endzones)
  // Endzones are ~18% of the field length each.
  const endzonePercent = (FIELD_DIMENSIONS.endzoneDepth / FIELD_DIMENSIONS.length) * 100;

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-emerald-600 rounded-3xl shadow-inner shadow-black/20"
         ref={fieldRef}
         onClick={handleTap}
    >
      {/* Field Markings */}
      <div className="absolute inset-0 pointer-events-none opacity-30 flex flex-col justify-between">
         {/* Top Endzone Line */}
         <div className="w-full border-b-2 border-white" style={{ height: `${endzonePercent}%` }}></div>
         {/* Brick marks or center logos could go here */}
         <div className="flex-1 flex items-center justify-center">
             <div className="w-24 h-24 rounded-full border-2 border-white/20"></div>
         </div>
         {/* Bottom Endzone Line */}
         <div className="w-full border-t-2 border-white" style={{ height: `${endzonePercent}%` }}></div>
      </div>

      {/* Grid Pattern Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grass.png')]"></div>

      {/* Last Event / Puck */}
      {lastLocation && (
        <div 
          className="absolute w-6 h-6 -ml-3 -mt-3 bg-white rounded-full shadow-lg shadow-black/30 ring-4 ring-blue-500/50 flex items-center justify-center animate-pulse z-20"
          style={getStyle(lastLocation)}
        >
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        </div>
      )}

      {/* History Trail (Last 5 throws) */}
      {events.slice(-5).map((event, i) => {
        const isGoal = event.type === EventType.GOAL;
        const color = event.type === EventType.DROP || event.type === EventType.THROWAWAY ? 'bg-red-400' : 'bg-white';
        
        return (
          <div 
            key={event.id}
            className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 ${color} rounded-full opacity-60 z-10 transition-all duration-500`}
            style={getStyle(event.location)}
          />
        );
      })}
    </div>
  );
};