
import React, { useState, useEffect, useRef } from 'react';
import { Field } from './components/Field';
import { Button } from './components/Button';
import { StatsSummary } from './components/StatsSummary';
import { LineupDrawer } from './components/LineupDrawer';
import { RadialPlayerMenu } from './components/RadialPlayerMenu';
import { MOCK_HOME_TEAM, MOCK_AWAY_TEAM } from './constants';
import { GameEvent, GameState, Player, TeamSide, Coordinate, EventType } from './types';
import { Undo2, BarChart2, Disc, ChevronsLeft } from 'lucide-react';

function App() {
  // Initialize default active lineup (first 7 players)
  const [gameState, setGameState] = useState<GameState>({
    events: [],
    score: { home: 0, away: 0 },
    currentPossession: null,
    hasDisc: null,
    isGameActive: false,
    activeLineup: {
      home: MOCK_HOME_TEAM.slice(0, 7).map(p => p.id),
      away: MOCK_AWAY_TEAM.slice(0, 7).map(p => p.id)
    }
  });

  // UI State
  const [showStats, setShowStats] = useState(false);
  const [showLineup, setShowLineup] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<Coordinate | null>(null);

  // Radial Menu Configuration
  const [radialConfig, setRadialConfig] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    type: 'THROWER' | 'RECEIVER' | null;
  }>({ isOpen: false, x: 0, y: 0, type: null });

  // Swipe Gestures
  const touchStartRef = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Optional: add realtime tracking if needed
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStartRef.current - touchEnd;
    
    // Swipe Left (Drag from right to left)
    if (distance > minSwipeDistance) {
        setShowLineup(true);
    }
    // Swipe Right (Drag from left to right) - Optional: could close drawers
    if (distance < -minSwipeDistance && showLineup) {
        setShowLineup(false);
    }

    touchStartRef.current = null;
  };

  // --- Actions ---

  const startGame = () => {
    setGameState(prev => ({ 
        ...prev, 
        isGameActive: true,
        currentPossession: 'home' // Simplify for demo: Home starts
    }));
  };

  const handleFieldTap = (coords: Coordinate, screenCoords: { x: number, y: number }) => {
    if (!gameState.isGameActive) return;
    
    setPendingLocation(coords);

    const team = gameState.currentPossession || 'home';
    
    // Determine context for Radial Menu
    if (!gameState.hasDisc) {
      // Pick Thrower (Startup / Pickup)
      setRadialConfig({
        isOpen: true,
        x: screenCoords.x,
        y: screenCoords.y,
        type: 'THROWER'
      });
    } else {
      // Pick Receiver (Pass)
      setRadialConfig({
        isOpen: true,
        x: screenCoords.x,
        y: screenCoords.y,
        type: 'RECEIVER'
      });
    }
  };

  const recordEvent = (type: EventType, player?: Player) => {
    // Allows drops/throwaways without a specific target location (uses last known)
    if (!pendingLocation && type !== EventType.DROP && type !== EventType.THROWAWAY) {
       return; 
    }

    // Determine event location: 
    // - Use pendingLocation for Catches/Goals/Pickups (where user tapped)
    // - For Drops/Throwaways, ideally use the location where it happened. 
    //   If triggered via button, use current disc location.
    const lastEvent = gameState.events[gameState.events.length-1];
    const eventLocation = pendingLocation || (lastEvent ? lastEvent.location : {x:50,y:50});

    const newEvent: GameEvent = {
      id: Date.now().toString(),
      type,
      location: eventLocation,
      timestamp: Date.now(),
      possessionSide: gameState.currentPossession || 'home',
      throwerId: gameState.hasDisc || undefined,
      receiverId: player?.id
    };

    let nextPossession = gameState.currentPossession;
    let nextHasDisc = gameState.hasDisc;
    let nextScore = { ...gameState.score };

    // Logic Engine
    switch (type) {
      case EventType.PICKUP:
        nextHasDisc = player?.id || null;
        break;
      case EventType.CATCH:
        nextHasDisc = player?.id || null;
        break;
      case EventType.GOAL:
        if (gameState.currentPossession === 'home') nextScore.home += 1;
        else nextScore.away += 1;
        nextHasDisc = null;
        nextPossession = nextPossession === 'home' ? 'away' : 'home'; // Turnover logic for pull
        break;
      case EventType.DROP:
      case EventType.THROWAWAY:
      case EventType.D_BLOCK:
        nextPossession = nextPossession === 'home' ? 'away' : 'home';
        nextHasDisc = null;
        break;
      case EventType.PULL:
         break;
    }

    setGameState(prev => ({
      ...prev,
      events: [...prev.events, newEvent],
      score: nextScore,
      currentPossession: nextPossession,
      hasDisc: nextHasDisc
    }));

    // Reset UI
    setPendingLocation(null);
    setRadialConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handlePlayerSelect = (player: Player) => {
    if (radialConfig.type === 'THROWER') {
        // Setting the initial thrower (Pickup/Setup)
        // recording PICKUP establishes the start of the line geometry
        recordEvent(EventType.PICKUP, player);
    } else if (radialConfig.type === 'RECEIVER') {
        // Completing a pass
        const isGoal = (pendingLocation?.y || 0) < 18 || (pendingLocation?.y || 0) > 82; // Rough endzone check
        if (isGoal) {
            recordEvent(EventType.GOAL, player);
        } else {
            recordEvent(EventType.CATCH, player);
        }
    }
  };

  const updateLineup = (team: TeamSide, playerIds: string[]) => {
      setGameState(prev => ({
          ...prev,
          activeLineup: {
              ...prev.activeLineup,
              [team]: playerIds
          }
      }));
  };

  const undoLast = () => {
    if (gameState.events.length === 0) return;
    const newEvents = [...gameState.events];
    newEvents.pop();
    
    // Simplistic state revert
    // In production, would use a full history stack
    // Recalculate hasDisc based on the new last event
    const last = newEvents[newEvents.length - 1];
    let restoredHasDisc = null;
    
    if (last) {
        if (last.type === EventType.CATCH || last.type === EventType.PICKUP) {
            restoredHasDisc = last.receiverId || last.throwerId || null; // For pickup, thrower is implied receiver of role
            if (last.type === EventType.PICKUP && !last.receiverId) restoredHasDisc = last.receiverId || null; // Fix: PICKUP doesn't have receiverId usually, actually we stored player as receiver? No, we need to check how we stored it.
            // In recordEvent for PICKUP: receiverId = player.id. Wait, recordEvent sets receiverId = player?.id.
            // So yes, restoredHasDisc = last.receiverId.
        }
    }

    setGameState(prev => ({
        ...prev,
        events: newEvents,
        hasDisc: restoredHasDisc
    }));
    
    setPendingLocation(null);
  };

  // --- Derived Data ---
  const lastEvent = gameState.events[gameState.events.length - 1];
  const lastLocation = pendingLocation || (lastEvent ? lastEvent.location : null);
  
  // Identify location of current disc holder (for visualization)
  const throwerLocation = gameState.hasDisc && lastEvent ? lastEvent.location : null;
  
  // Identify preview location (where user just tapped for a potential pass)
  // Only show if we are actively selecting a receiver
  const isSelectingReceiver = radialConfig.isOpen && radialConfig.type === 'RECEIVER';
  const previewLocation = isSelectingReceiver ? pendingLocation : null;

  // Filter active players based on Lineup
  const activeHomePlayers = MOCK_HOME_TEAM.filter(p => gameState.activeLineup.home.includes(p.id));
  const activeAwayPlayers = MOCK_AWAY_TEAM.filter(p => gameState.activeLineup.away.includes(p.id));
  const allPlayers = [...MOCK_HOME_TEAM, ...MOCK_AWAY_TEAM];
  
  // Players to show in Radial Menu
  const currentTeam = gameState.currentPossession === 'home' ? activeHomePlayers : activeAwayPlayers;
  // If selecting receiver, exclude current thrower
  const availablePlayers = radialConfig.type === 'RECEIVER' 
     ? currentTeam.filter(p => p.id !== gameState.hasDisc)
     : currentTeam;

  const activePlayer = gameState.hasDisc 
    ? allPlayers.find(p => p.id === gameState.hasDisc)
    : null;

  return (
    // Use dvh (Dynamic Viewport Height) for better mobile browser support
    <div 
        className="h-[100dvh] w-full flex flex-col bg-gray-50 font-sans"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
      
      {/* Header - Safe Area Top aware */}
      <header className="pt-safe-top sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
         <div className="h-12 px-4 flex items-center justify-between max-w-3xl mx-auto w-full">
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                     <Disc size={18} className="text-white" />
                 </div>
                 <div className="flex flex-col">
                     <h1 className="text-sm font-bold text-slate-900 leading-none tracking-tight">UltiTrack</h1>
                 </div>
             </div>
             
             {gameState.isGameActive && (
                 <div className="flex items-center bg-gray-100/50 p-1 rounded-xl border border-gray-200/50 scale-90">
                     <div className="px-3 flex flex-col items-center">
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Home</span>
                         <span className="text-base font-bold text-blue-600 leading-none">{gameState.score.home}</span>
                     </div>
                     <div className="h-5 w-px bg-gray-200"></div>
                     <div className="px-3 flex flex-col items-center">
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Away</span>
                         <span className="text-base font-bold text-red-500 leading-none">{gameState.score.away}</span>
                     </div>
                 </div>
             )}

             <button 
                onClick={() => setShowStats(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-slate-600 hover:bg-gray-200 active:scale-95 transition-all"
             >
                 <BarChart2 size={18} />
             </button>
         </div>
      </header>

      {/* Main Game Area */}
      {/* Reduced bottom padding to maximize field size */}
      <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center w-full bg-gray-100/50 pb-[130px]">
          {!gameState.isGameActive ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm p-8 animate-in fade-in duration-500">
                  <div className="max-w-xs w-full text-center space-y-6">
                      <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-blue-500/30 flex items-center justify-center mx-auto transform transition-transform hover:scale-105 duration-300">
                          <Disc size={48} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ready to Play?</h2>
                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">Track passes, goals, and turnovers with precision. The ultimate companion for your match.</p>
                      </div>
                      <Button fullWidth size="lg" onClick={startGame} className="shadow-xl shadow-blue-500/20">
                        Start New Game
                      </Button>
                  </div>
              </div>
          ) : null}

          {/* Field Container - Fits height, scales width based on Aspect Ratio */}
          <div className="relative h-full w-full flex items-center justify-center"> 
              <Field 
                  onTap={handleFieldTap} 
                  events={gameState.events} 
                  lastLocation={lastLocation}
                  orientation="vertical"
                  currentPossession={gameState.currentPossession}
                  players={allPlayers}
                  discLocation={throwerLocation}
                  previewLocation={previewLocation}
                  throwerId={gameState.hasDisc || undefined}
              />
              
              {/* Swipe Hint */}
              {gameState.isGameActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-20 hover:opacity-100 transition-opacity pointer-events-none">
                     <div className="glass-panel p-2 rounded-l-xl">
                        <ChevronsLeft className="animate-pulse text-slate-900" />
                     </div>
                  </div>
              )}
          </div>
      </main>

      {/* Action Bar (Sticky Bottom) - Safe Area Bottom aware */}
      {gameState.isGameActive && (
          <div className="fixed bottom-0 left-0 right-0 pb-safe-bottom bg-white/90 backdrop-blur-xl border-t border-gray-200/50 z-40 rounded-t-[1.5rem] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
              <div className="max-w-3xl mx-auto w-full">
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-5 pt-3 pb-2">
                    <div className="flex items-center gap-3">
                        {activePlayer ? (
                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20 ring-2 ring-white">
                                  {activePlayer.number}
                              </div>
                              <div className="flex flex-col">
                                  <div className="text-[9px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">Possession</div>
                                  <div className="font-bold text-slate-900 text-sm leading-none">{activePlayer.name}</div>
                              </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 opacity-50">
                                <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse"></div>
                                <div className="space-y-1">
                                    <div className="h-2 w-16 bg-slate-200 rounded animate-pulse"></div>
                                    <div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={undoLast} 
                        disabled={gameState.events.length === 0}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <Undo2 size={16} />
                        <span>Undo</span>
                    </button>
                  </div>

                  {/* Action Grid */}
                  <div className="px-4 pb-3">
                      <div className="grid grid-cols-4 gap-2">
                          {gameState.hasDisc ? (
                              <>
                                <div className="col-span-2 h-11 flex items-center justify-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    Tap Field to Pass
                                </div>
                                <Button variant="danger" size="sm" className="col-span-1 h-11 rounded-xl text-xs" onClick={() => recordEvent(EventType.THROWAWAY)}>Throwaway</Button>
                                <Button variant="secondary" size="sm" className="col-span-1 h-11 rounded-xl text-xs" onClick={() => recordEvent(EventType.DROP)}>Drop</Button>
                              </>
                          ) : (
                             <div 
                                className="col-span-4 h-11 flex items-center justify-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200"
                             >
                                Tap Field to Select Thrower
                             </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Drawers & Modals */}
      
      {/* 1. Radial Menu (Replaces PlayerDrawer for gameplay) */}
      <RadialPlayerMenu 
         isOpen={radialConfig.isOpen}
         onClose={() => setRadialConfig({...radialConfig, isOpen: false})}
         x={radialConfig.x}
         y={radialConfig.y}
         players={availablePlayers}
         onSelect={handlePlayerSelect}
         title={radialConfig.type === 'RECEIVER' ? 'Pass To' : 'Thrower'}
      />

      {/* 2. Lineup Management (Swipe Left) */}
      <LineupDrawer
        isOpen={showLineup}
        onClose={() => setShowLineup(false)}
        homeRoster={MOCK_HOME_TEAM}
        awayRoster={MOCK_AWAY_TEAM}
        currentLineup={gameState.activeLineup}
        onUpdateLineup={updateLineup}
        initialTab={gameState.currentPossession || 'home'}
      />

      {/* 3. Stats */}
      {showStats && (
        <StatsSummary 
          events={gameState.events} 
          score={gameState.score}
          onClose={() => setShowStats(false)} 
        />
      )}
    </div>
  );
}

export default App;
