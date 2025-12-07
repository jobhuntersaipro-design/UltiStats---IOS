import React, { useRef } from 'react';
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
    
    const rect = fieldRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    onTap({ x, y });
  };

  const getStyle = (coords: Coordinate) => ({
    left: `${coords.x}%`,
    top: `${coords.y}%`,
  });

  // Endzones are ~18% of the field length each.
  const endzonePercent = (FIELD_DIMENSIONS.endzoneDepth / FIELD_DIMENSIONS.length) * 100;

  return (
    <div className="relative w-full h-full select-none bg-[#378b5e] overflow-hidden"
         ref={fieldRef}
         onClick={handleTap}
    >
      {/* Texture & Gradients */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none mix-blend-overlay"></div>
      
      {/* Field Striping (Subtle horizontal stripes) */}
      <div className="absolute inset-0 flex flex-col pointer-events-none opacity-5">
        {[...Array(10)].map((_, i) => (
           <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`}></div>
        ))}
      </div>

      {/* Field Markings */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
         {/* Top Endzone */}
         <div className="w-full relative border-b-2 border-white/40" style={{ height: `${endzonePercent}%` }}>
             <div className="absolute inset-0 flex items-center justify-center opacity-20">
                 <span className="text-4xl font-black text-white tracking-widest uppercase rotate-180">Endzone</span>
             </div>
         </div>
         
         {/* Center Field */}
         <div className="flex-1 relative flex items-center justify-center">
             {/* Brick Marks */}
             <div className="absolute top-[20%] w-3 h-0.5 bg-white/40"></div>
             <div className="absolute bottom-[20%] w-3 h-0.5 bg-white/40"></div>
             
             {/* Center Circle */}
             <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center">
                 <div className="w-1 h-1 bg-white/40 rounded-full"></div>
             </div>
         </div>

         {/* Bottom Endzone */}
         <div className="w-full relative border-t-2 border-white/40" style={{ height: `${endzonePercent}%` }}>
             <div className="absolute inset-0 flex items-center justify-center opacity-20">
                 <span className="text-4xl font-black text-white tracking-widest uppercase">Endzone</span>
             </div>
         </div>
      </div>

      {/* History Trail */}
      <svg className="absolute inset-0 pointer-events-none opacity-40 overflow-visible">
          {events.length > 1 && events.slice(-6).map((event, i, arr) => {
              if (i === 0) return null;
              const prev = arr[i-1];
              // Don't draw lines between disconnected events (like after a goal)
              if (event.timestamp - prev.timestamp > 60000 || event.type === EventType.GOAL) return null;
              
              return (
                  <line 
                    key={`line-${event.id}`}
                    x1={`${prev.location.x}%`} y1={`${prev.location.y}%`}
                    x2={`${event.location.x}%`} y2={`${event.location.y}%`}
                    stroke="white"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
              );
          })}
      </svg>

      {/* Event Markers */}
      {events.slice(-5).map((event) => {
        const isGoal = event.type === EventType.GOAL;
        const isTurnover = event.type === EventType.DROP || event.type === EventType.THROWAWAY;
        const bg = isGoal ? 'bg-yellow-400 ring-yellow-200' : isTurnover ? 'bg-red-500 ring-red-300' : 'bg-white ring-white/50';
        
        return (
          <div 
            key={event.id}
            className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 ${bg} rounded-full ring-2 shadow-sm z-10 transition-all duration-500`}
            style={getStyle(event.location)}
          />
        );
      })}

      {/* Current Active Location Indicator */}
      {lastLocation && (
        <div 
          className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center z-20 pointer-events-none"
          style={getStyle(lastLocation)}
        >
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-4 h-4 bg-white rounded-full shadow-lg ring-4 ring-blue-500 flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};