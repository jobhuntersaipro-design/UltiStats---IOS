import React, { useState, useEffect } from 'react';
import { Field } from './components/Field';
import { Button } from './components/Button';
import { PlayerDrawer } from './components/PlayerDrawer';
import { StatsSummary } from './components/StatsSummary';
import { MOCK_HOME_TEAM, MOCK_AWAY_TEAM } from './constants';
import { GameEvent, GameState, Player, TeamSide, Coordinate, EventType } from './types';
import { Undo2, Menu, Share2, BarChart2, Plus, Disc } from 'lucide-react';

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
    
    // Store the location and trigger next step based on state
    setPendingLocation(coords);

    // If nobody has the disc, we are selecting the Thrower (Start of point or after turn)
    if (!gameState.hasDisc) {
      setDrawerConfig({
        isOpen: true,
        type: 'THROWER',
        team: gameState.currentPossession || 'home'
      });
    } else {
      // If someone has the disc, this tap is the TARGET location.
      // We don't open drawer immediately. The user must click an action button (Pass, Goal, Turn).
      // However, for a fluid UX, we can assume a catch if they tap near endzone or just assume pass.
      // Let's keep it simple: Tap sets target marker. Action Sheet appears (simulated by buttons below).
    }
  };

  const recordEvent = (type: EventType, player?: Player) => {
    if (!pendingLocation && type !== EventType.DROP && type !== EventType.THROWAWAY) {
       // Ideally show error toast
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
         // Just records location
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
    // Simplified undo: just removing event. In real app, need to revert state snapshot.
    // For now, we just reset disc state to null to prevent lockup
    setGameState(prev => ({
        ...prev,
        events: newEvents,
        hasDisc: null // Force re-selection of thrower
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
    <div className="h-full w-full flex flex-col bg-gray-50">
      
      {/* Header */}
      <header className="h-16 px-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-200 z-30 sticky top-0">
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-black/20">
                 U
             </div>
             <div className="flex flex-col">
                 <h1 className="text-sm font-bold text-slate-900 leading-none">UltiTrack</h1>
                 <span className="text-xs text-slate-500 font-medium">Pro Series</span>
             </div>
         </div>
         
         {gameState.isGameActive && (
             <div className="flex items-center gap-4">
                 <div className="flex flex-col items-center">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Home</span>
                     <span className="text-xl font-bold text-blue-600 leading-none">{gameState.score.home}</span>
                 </div>
                 <span className="text-slate-300 font-light">:</span>
                 <div className="flex flex-col items-center">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Away</span>
                     <span className="text-xl font-bold text-red-500 leading-none">{gameState.score.away}</span>
                 </div>
             </div>
         )}

         <Button variant="ghost" size="sm" onClick={() => setShowStats(true)}>
             <BarChart2 size={20} />
         </Button>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
          {!gameState.isGameActive ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm p-8">
                  <div className="text-center max-w-sm">
                      <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Disc size={40} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready for the Match?</h2>
                      <p className="text-slate-500 mb-8">Start tracking comprehensive stats for your Ultimate Frisbee game.</p>
                      <Button fullWidth size="lg" onClick={startGame}>Start New Game</Button>
                  </div>
              </div>
          ) : null}

          <div className="flex-1 p-4 pb-32 relative"> 
              <Field 
                onTap={handleFieldTap} 
                events={gameState.events} 
                lastLocation={lastLocation}
                orientation="vertical"
              />
              
              {/* Instructions Overlay */}
              {gameState.isGameActive && !gameState.hasDisc && !pendingLocation && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 glass-panel-dark px-4 py-2 rounded-full shadow-xl pointer-events-none">
                      <span className="text-white text-sm font-medium">Tap field to set disc location</span>
                  </div>
              )}
              
              {gameState.hasDisc && pendingLocation && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 px-4 py-2 rounded-full shadow-xl pointer-events-none animate-bounce">
                      <span className="text-white text-sm font-bold">Select Action Below</span>
                  </div>
              )}
          </div>
      </main>

      {/* Action Bar (Sticky Bottom) */}
      {gameState.isGameActive && (
          <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-white/90 backdrop-blur-xl border-t border-gray-200 z-40 rounded-t-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              
              <div className="flex items-center justify-between mb-4 px-2">
                 <div className="flex items-center gap-3">
                     {activePlayer ? (
                        <>
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                              {activePlayer.number}
                          </div>
                          <div>
                              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Possession</div>
                              <div className="font-semibold text-slate-900">{activePlayer.name}</div>
                          </div>
                        </>
                     ) : (
                        <div className="text-sm font-medium text-slate-500 italic">Waiting for input...</div>
                     )}
                 </div>
                 
                 <Button variant="ghost" size="sm" onClick={undoLast} disabled={gameState.events.length === 0}>
                     <Undo2 size={20} className="mr-2" /> Undo
                 </Button>
              </div>

              {/* Action Buttons Context */}
              <div className="grid grid-cols-4 gap-3">
                  {gameState.hasDisc && pendingLocation ? (
                      <>
                        <Button 
                            variant="primary" 
                            className="col-span-2" 
                            onClick={() => setDrawerConfig({isOpen: true, type: 'RECEIVER', team: gameState.currentPossession || 'home'})}
                        >
                            Complete
                        </Button>
                        <Button variant="danger" onClick={() => recordEvent(EventType.THROWAWAY)}>Throwaway</Button>
                        <Button variant="secondary" onClick={() => recordEvent(EventType.DROP)}>Drop</Button>
                      </>
                  ) : gameState.hasDisc ? (
                     <div className="col-span-4 text-center text-slate-400 py-3 text-sm">
                        Tap new location on field to throw
                     </div>
                  ) : (
                     <Button 
                        variant="secondary" 
                        fullWidth 
                        className="col-span-4"
                        onClick={() => setDrawerConfig({isOpen: true, type: 'THROWER', team: gameState.currentPossession || 'home'})}
                     >
                        Set Thrower
                     </Button>
                  )}
              </div>
          </div>
      )}

      {/* Drawers & Modals */}
      <PlayerDrawer 
         isOpen={drawerConfig.isOpen}
         onClose={() => setDrawerConfig({...drawerConfig, isOpen: false})}
         title={drawerConfig.type === 'RECEIVER' ? 'Select Receiver' : 'Who has the disc?'}
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