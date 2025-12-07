import React, { useState, useEffect } from 'react';
import { Field } from './components/Field';
import { Button } from './components/Button';
import { PlayerDrawer } from './components/PlayerDrawer';
import { StatsSummary } from './components/StatsSummary';
import { MOCK_HOME_TEAM, MOCK_AWAY_TEAM } from './constants';
import { GameEvent, GameState, Player, TeamSide, Coordinate, EventType } from './types';
import { Undo2, Menu, Share2, BarChart2, Plus, Disc, ChevronRight } from 'lucide-react';

function App() {
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    events: [],
    score: { home: 0, away: 0 },
    currentPossession: null,
    hasDisc: null,
    isGameActive: false,
    activeLineup: { home: [], away: [] }
  });

  // UI State
  const [showStats, setShowStats] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<Coordinate | null>(null);
  
  // Selection Drawers
  const [drawerConfig, setDrawerConfig] = useState<{
    isOpen: boolean;
    type: 'THROWER' | 'RECEIVER' | 'DEFENDER' | null;
    team: TeamSide;
  }>({ isOpen: false, type: null, team: 'home' });

  // --- Actions ---

  const startGame = () => {
    setGameState(prev => ({ 
        ...prev, 
        isGameActive: true,
        currentPossession: 'home' // Simplify for demo: Home starts
    }));
  };

  const handleFieldTap = (coords: Coordinate) => {
    if (!gameState.isGameActive) return;
    
    setPendingLocation(coords);

    // If nobody has the disc, we are selecting the Thrower (Start of point or after turn)
    if (!gameState.hasDisc) {
      setDrawerConfig({
        isOpen: true,
        type: 'THROWER',
        team: gameState.currentPossession || 'home'
      });
    }
  };

  const recordEvent = (type: EventType, player?: Player) => {
    if (!pendingLocation && type !== EventType.DROP && type !== EventType.THROWAWAY) {
       return; 
    }

    const newEvent: GameEvent = {
      id: Date.now().toString(),
      type,
      location: pendingLocation || {x: 50, y: 50}, // Default center if no loc
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
    setDrawerConfig({ isOpen: false, type: null, team: 'home' });
  };

  const handlePlayerSelect = (player: Player) => {
    if (drawerConfig.type === 'THROWER') {
        // Setting the initial thrower
        setGameState(prev => ({ ...prev, hasDisc: player.id }));
        setDrawerConfig({ ...drawerConfig, isOpen: false });
    } else if (drawerConfig.type === 'RECEIVER') {
        // Completing a pass
        const isGoal = (pendingLocation?.y || 0) < 18 || (pendingLocation?.y || 0) > 82; // Rough endzone check
        if (isGoal) {
            recordEvent(EventType.GOAL, player);
        } else {
            recordEvent(EventType.CATCH, player);
        }
    }
  };

  const undoLast = () => {
    if (gameState.events.length === 0) return;
    const newEvents = [...gameState.events];
    newEvents.pop();
    setGameState(prev => ({
        ...prev,
        events: newEvents,
        hasDisc: null 
    }));
    setPendingLocation(null);
  };

  // --- Derived Data ---
  const lastEvent = gameState.events[gameState.events.length - 1];
  const lastLocation = pendingLocation || (lastEvent ? lastEvent.location : null);
  const activeTeam = gameState.currentPossession === 'home' ? MOCK_HOME_TEAM : MOCK_AWAY_TEAM;
  const activePlayer = gameState.hasDisc 
    ? [...MOCK_HOME_TEAM, ...MOCK_AWAY_TEAM].find(p => p.id === gameState.hasDisc)
    : null;

  return (
    // Use dvh (Dynamic Viewport Height) for better mobile browser support
    <div className="h-[100dvh] w-full flex flex-col bg-gray-50 font-sans">
      
      {/* Header - Safe Area Top aware */}
      <header className="pt-safe-top sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
         <div className="h-14 px-4 flex items-center justify-between max-w-3xl mx-auto w-full">
             <div className="flex items-center gap-3">
                 <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                     <Disc size={20} className="text-white" />
                 </div>
                 <div className="flex flex-col">
                     <h1 className="text-sm font-bold text-slate-900 leading-none tracking-tight">UltiTrack</h1>
                     <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">Match Day</span>
                 </div>
             </div>
             
             {gameState.isGameActive && (
                 <div className="flex items-center bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
                     <div className="px-3 flex flex-col items-center">
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Home</span>
                         <span className="text-lg font-bold text-blue-600 leading-none">{gameState.score.home}</span>
                     </div>
                     <div className="h-6 w-px bg-gray-200"></div>
                     <div className="px-3 flex flex-col items-center">
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Away</span>
                         <span className="text-lg font-bold text-red-500 leading-none">{gameState.score.away}</span>
                     </div>
                 </div>
             )}

             <button 
                onClick={() => setShowStats(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-slate-600 hover:bg-gray-200 active:scale-95 transition-all"
             >
                 <BarChart2 size={20} />
             </button>
         </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col items-center w-full bg-gray-100/50">
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

          {/* Field Container - Max width for iPad/Desktop */}
          <div className="flex-1 w-full max-w-lg h-full p-4 pb-32 relative flex flex-col justify-center"> 
              <div className="relative w-full h-full max-h-[800px] shadow-2xl shadow-emerald-900/10 rounded-3xl overflow-hidden ring-1 ring-black/5 transform transition-all duration-300">
                <Field 
                    onTap={handleFieldTap} 
                    events={gameState.events} 
                    lastLocation={lastLocation}
                    orientation="vertical"
                />
              </div>
              
              {/* Contextual Hints */}
              <div className="absolute top-8 left-0 right-0 pointer-events-none flex justify-center z-10 px-6">
                 {gameState.isGameActive && !gameState.hasDisc && !pendingLocation && (
                     <div className="glass-panel-dark px-5 py-2.5 rounded-full shadow-lg animate-in slide-in-from-top-4 duration-300 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                         <span className="text-white text-xs font-semibold tracking-wide">Tap field to set disc location</span>
                     </div>
                 )}
                 
                 {gameState.hasDisc && pendingLocation && (
                     <div className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl shadow-blue-600/30 animate-in zoom-in-95 duration-200 flex items-center gap-2">
                         <span className="text-sm font-bold">Select Action Below</span>
                         <ChevronRight size={16} className="animate-bounce-x" />
                     </div>
                 )}
              </div>
          </div>
      </main>

      {/* Action Bar (Sticky Bottom) - Safe Area Bottom aware */}
      {gameState.isGameActive && (
          <div className="fixed bottom-0 left-0 right-0 pb-safe-bottom bg-white/90 backdrop-blur-xl border-t border-gray-200/50 z-40 rounded-t-[2rem] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
              <div className="max-w-3xl mx-auto w-full">
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-6 pt-5 pb-4">
                    <div className="flex items-center gap-3">
                        {activePlayer ? (
                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-500/20 ring-2 ring-white">
                                  {activePlayer.number}
                              </div>
                              <div className="flex flex-col">
                                  <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">Current Possession</div>
                                  <div className="font-bold text-slate-900 text-base leading-none">{activePlayer.name}</div>
                              </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 opacity-50">
                                <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse"></div>
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
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <Undo2 size={18} />
                        <span>Undo</span>
                    </button>
                  </div>

                  {/* Action Grid */}
                  <div className="px-4 pb-4">
                      <div className="grid grid-cols-4 gap-3">
                          {gameState.hasDisc && pendingLocation ? (
                              <>
                                <Button 
                                    variant="primary" 
                                    className="col-span-2 shadow-blue-500/25" 
                                    onClick={() => setDrawerConfig({isOpen: true, type: 'RECEIVER', team: gameState.currentPossession || 'home'})}
                                >
                                    Complete
                                </Button>
                                <Button variant="danger" className="col-span-1" onClick={() => recordEvent(EventType.THROWAWAY)}>Throwaway</Button>
                                <Button variant="secondary" className="col-span-1" onClick={() => recordEvent(EventType.DROP)}>Drop</Button>
                              </>
                          ) : gameState.hasDisc ? (
                             <div className="col-span-4 h-12 flex items-center justify-center text-slate-400 text-sm font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                Tap a location on the field to pass
                             </div>
                          ) : (
                             <Button 
                                variant="secondary" 
                                fullWidth 
                                className="col-span-4 border-slate-200 bg-white text-slate-900 font-semibold shadow-sm"
                                onClick={() => setDrawerConfig({isOpen: true, type: 'THROWER', team: gameState.currentPossession || 'home'})}
                             >
                                Select Thrower
                             </Button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Drawers & Modals */}
      <PlayerDrawer 
         isOpen={drawerConfig.isOpen}
         onClose={() => setDrawerConfig({...drawerConfig, isOpen: false})}
         title={drawerConfig.type === 'RECEIVER' ? 'Pass Completed To' : 'Who picked up the disc?'}
         players={activeTeam}
         onSelect={handlePlayerSelect}
      />

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