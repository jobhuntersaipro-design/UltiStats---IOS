import React, { useState } from 'react';
import { Player, TeamSide } from '../types';
import { X, Users, Check } from 'lucide-react';

interface LineupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  homeRoster: Player[];
  awayRoster: Player[];
  currentLineup: { home: string[], away: string[] };
  onUpdateLineup: (team: TeamSide, playerIds: string[]) => void;
  initialTab?: TeamSide;
}

export const LineupDrawer: React.FC<LineupDrawerProps> = ({
  isOpen,
  onClose,
  homeRoster,
  awayRoster,
  currentLineup,
  onUpdateLineup,
  initialTab = 'home'
}) => {
  const [activeTab, setActiveTab] = useState<TeamSide>(initialTab);

  if (!isOpen) return null;

  const currentRoster = activeTab === 'home' ? homeRoster : awayRoster;
  const currentSelection = activeTab === 'home' ? currentLineup.home : currentLineup.away;
  const isFull = currentSelection.length >= 7;

  const togglePlayer = (playerId: string) => {
    const isSelected = currentSelection.includes(playerId);
    let newSelection;
    
    if (isSelected) {
      newSelection = currentSelection.filter(id => id !== playerId);
    } else {
      if (isFull) return; // Max 7
      newSelection = [...currentSelection, playerId];
    }
    
    onUpdateLineup(activeTab, newSelection);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Side Drawer (Slide from Right) */}
      <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-gray-50 shadow-2xl transform transition-transform animate-in slide-in-from-right duration-300 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-blue-600" size={24} />
              Active Lineup
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Swipe left to close or tap X</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition-all">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex p-1 bg-gray-100 rounded-xl">
            {(['home', 'away'] as TeamSide[]).map((team) => (
              <button
                key={team}
                onClick={() => setActiveTab(team)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                  activeTab === team 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {team} Team
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Selected Players</span>
            <span className={`font-bold ${currentSelection.length === 7 ? 'text-green-600' : 'text-blue-600'}`}>
              {currentSelection.length} / 7
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
             <div 
               className={`h-full transition-all duration-300 ${currentSelection.length === 7 ? 'bg-green-500' : 'bg-blue-500'}`} 
               style={{ width: `${(currentSelection.length / 7) * 100}%` }}
             ></div>
          </div>
        </div>

        {/* Player List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {currentRoster.map(player => {
            const isSelected = currentSelection.includes(player.id);
            return (
              <button
                key={player.id}
                onClick={() => togglePlayer(player.id)}
                disabled={!isSelected && isFull}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                } ${(!isSelected && isFull) ? 'opacity-40' : 'active:scale-[0.98]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {player.number}
                  </div>
                  <div className="text-left">
                    <div className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                      {player.name}
                    </div>
                    <div className="text-xs text-slate-500">{player.gender}</div>
                  </div>
                </div>
                {isSelected && (
                  <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};