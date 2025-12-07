
import React, { useRef } from 'react';
import { Coordinate, GameEvent, EventType, TeamSide, Player } from '../types';
import { FIELD_DIMENSIONS } from '../constants';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface FieldProps {
  onTap: (coords: Coordinate, screenCoords: { x: number, y: number }) => void;
  events: GameEvent[];
  lastLocation: Coordinate | null;
  orientation: 'vertical' | 'horizontal';
  currentPossession: TeamSide | null;
  players: Player[];
  discLocation?: Coordinate | null;
  previewLocation?: Coordinate | null;
  throwerId?: string;
}

export const Field: React.FC<FieldProps> = ({ 
  onTap, 
  events, 
  lastLocation, 
  orientation = 'vertical',
  currentPossession,
  players,
  discLocation,
  previewLocation,
  throwerId
}) => {
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

    onTap({ x, y }, { x: clientX, y: clientY });
  };

  const getStyle = (coords: Coordinate) => ({
    left: `${coords.x}%`,
    top: `${coords.y}%`,
  });

  const getPlayerById = (id?: string) => players.find(p => p.id === id);

  const endzonePercent = (FIELD_DIMENSIONS.endzoneDepth / FIELD_DIMENSIONS.length) * 100;

  // Simple Logic: Home attacks UP (0), Away attacks DOWN (100)
  const isHomeAttacking = currentPossession === 'home';
  const showDirection = currentPossession !== null;
  
  // Consistency: Show same amount of history for lines and dots
  const VISIBLE_HISTORY_COUNT = 6;

  // Active Thrower (for "Ghost" visualization when pickup happens without event)
  const activeThrower = throwerId ? getPlayerById(throwerId) : null;

  return (
    <div className="relative h-full aspect-[37/100] w-auto mx-auto select-none bg-[#378b5e] overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/5"
         ref={fieldRef}
         onClick={handleTap}
    >
      {/* Texture & Gradients */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none mix-blend-overlay"></div>
      
      {/* Field Striping */}
      <div className="absolute inset-0 flex flex-col pointer-events-none opacity-5">
        {[...Array(10)].map((_, i) => (
           <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`}></div>
        ))}
      </div>

      {/* Attacking Direction Overlay (Subtle) */}
      {showDirection && (
        <div className={`absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-10 transition-all duration-1000 ${isHomeAttacking ? 'pb-20' : 'pt-20'}`}>
            {isHomeAttacking ? (
                <>
                    <ChevronUp size={80} className="text-white animate-pulse" strokeWidth={3} />
                </>
            ) : (
                <>
                    <ChevronDown size={80} className="text-white animate-pulse" strokeWidth={3} />
                </>
            )}
        </div>
      )}

      {/* Field Markings */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
         {/* Top Endzone Line */}
         <div 
            className={`w-full relative border-b-2 border-white/40 transition-colors duration-500`} 
            style={{ height: `${endzonePercent}%` }}
         />
         
         {/* Center Field */}
         <div className="flex-1 relative flex items-center justify-center w-full">
             {/* Length Dimensions (Sides) */}
             <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-white/30 text-[9px] font-bold tracking-[0.15em] whitespace-nowrap">
                 64m
             </div>

             {/* Brick Marks */}
             <div className="absolute top-[28%] w-2 h-0.5 bg-white/40"></div>
             <div className="absolute bottom-[28%] w-2 h-0.5 bg-white/40"></div>
             
             {/* Center X */}
             <div className="relative w-4 h-4 opacity-40">
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white -translate-y-1/2 rotate-45"></div>
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white -translate-y-1/2 -rotate-45"></div>
             </div>
         </div>

         {/* Bottom Endzone Line */}
         <div 
            className={`w-full relative border-t-2 border-white/40 transition-colors duration-500`} 
            style={{ height: `${endzonePercent}%` }}
         >
             {/* Width marker at bottom */}
             <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-white/30 text-[9px] font-bold tracking-[0.15em]">
                 37m
             </div>
         </div>
      </div>

      {/* Pass Visualization Layer (Lines) */}
      <svg className="absolute inset-0 pointer-events-none overflow-visible z-10">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
            </filter>
            {/* Blue Arrowhead for recent/preview pass */}
            <marker id="arrowhead-blue" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            {/* White Arrowhead for history */}
            <marker id="arrowhead-white" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto">
               <path d="M0,0 L4,2 L0,4" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          
          {/* 1. History Trail */}
          {events.length > 1 && events.slice(-VISIBLE_HISTORY_COUNT).map((event, i, arr) => {
              if (i === 0) return null;
              const prev = arr[i-1];
              
              // LOGIC: Draw a line from 'prev' to 'event' ONLY if it represents a valid pass sequence.
              // We do NOT draw lines starting from a 'DROP' or 'TURNOVER' or 'GOAL'.
              // We do NOT draw lines ending at 'PICKUP' or 'PULL'.
              // We DO draw lines from 'PICKUP' -> 'CATCH' (First pass)
              // We DO draw lines from 'CATCH' -> 'CATCH' (Next pass)
              
              const isValidStart = prev.type === EventType.CATCH || prev.type === EventType.PICKUP;
              const isValidEnd = event.type !== EventType.PICKUP && event.type !== EventType.PULL;
              
              if (!isValidStart || !isValidEnd) return null;

              return (
                  <line 
                    key={`line-${event.id}`}
                    x1={`${prev.location.x}%`} y1={`${prev.location.y}%`}
                    x2={`${event.location.x}%`} y2={`${event.location.y}%`}
                    stroke="white"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    markerEnd="url(#arrowhead-white)"
                    filter="url(#shadow)"
                    className="opacity-70"
                  />
              );
          })}

          {/* 2. Live Preview Line (Thrower -> Target) */}
          {discLocation && previewLocation && (
             <g className="animate-pulse">
                <line 
                  x1={`${discLocation.x}%`} y1={`${discLocation.y}%`}
                  x2={`${previewLocation.x}%`} y2={`${previewLocation.y}%`}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead-blue)"
                  className="opacity-80"
                />
             </g>
          )}
      </svg>

      {/* Event Markers (History) */}
      {events.slice(-VISIBLE_HISTORY_COUNT).map((event) => {
        const relevantPlayerId = event.receiverId || event.throwerId; // For pickup, thrower is stored in receiverId prop based on App logic or just use throwerId? App says throwerId.
        // Wait, for PICKUP, throwerId is set. For CATCH, receiverId is set.
        
        let player = getPlayerById(event.receiverId);
        if (event.type === EventType.PICKUP || (!player && event.throwerId)) {
            player = getPlayerById(event.throwerId);
        }
        
        const isGoal = event.type === EventType.GOAL;
        const isTurnover = event.type === EventType.DROP || event.type === EventType.THROWAWAY;
        const isPickup = event.type === EventType.PICKUP;
        
        return (
          <div 
            key={event.id}
            className="absolute z-20 w-0 h-0 overflow-visible flex items-center justify-center"
            style={getStyle(event.location)}
          >
            {player ? (
                <>
                    {/* Avatar Circle */}
                    <div className={`
                        absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2
                        rounded-full flex items-center justify-center 
                        text-[10px] font-bold shadow-lg border-2 border-white
                        ${isGoal ? 'bg-yellow-400 text-yellow-900' : isTurnover ? 'bg-red-500 text-white' : isPickup ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}
                    `}>
                        {player.number}
                    </div>
                    {/* Name Label */}
                    <div className="absolute top-5 -translate-x-1/2 px-1.5 py-0.5 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-white/20">
                        <span className="text-[8px] font-bold text-slate-800 whitespace-nowrap block leading-none">
                            {player.name.split(' ')[0]}
                        </span>
                    </div>
                </>
            ) : (
                <div className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-sm bg-white" />
            )}
          </div>
        );
      })}

      {/* Active Thrower Marker (Ghost for when user just tapped Pickup, displayed before event is committed? No, now event IS committed) */}
      {/* However, we keep this for the 'preview' state if the event is the latest one, ensuring high visibility */}
      {activeThrower && discLocation && (
          <div 
            className="absolute z-30 w-0 h-0 overflow-visible flex items-center justify-center"
            style={getStyle(discLocation)}
          >
              <div className="absolute w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg border-2 border-blue-500 bg-blue-600 text-white animate-in zoom-in duration-300">
                  {activeThrower.number}
              </div>
              <div className="absolute top-5 -translate-x-1/2 px-2 py-0.5 bg-blue-600 text-white rounded-md shadow-sm">
                  <span className="text-[8px] font-bold whitespace-nowrap block leading-none">
                      {activeThrower.name.split(' ')[0]}
                  </span>
              </div>
          </div>
      )}

      {/* Current Selection Indicator */}
      {lastLocation && !events.some(e => e.location === lastLocation) && !discLocation && (
        <div 
          className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center z-20 pointer-events-none"
          style={getStyle(lastLocation)}
        >
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-2.5 h-2.5 bg-white rounded-full shadow-lg ring-2 ring-blue-500"></div>
        </div>
      )}
    </div>
  );
};
