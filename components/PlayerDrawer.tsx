import React from 'react';
import { Player } from '../types';
import { X } from 'lucide-react';

interface PlayerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  players: Player[];
  onSelect: (player: Player) => void;
}

export const PlayerDrawer: React.FC<PlayerDrawerProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  players, 
  onSelect 
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2rem] shadow-2xl transform transition-transform animate-in slide-in-from-bottom duration-300 max-h-[70vh] flex flex-col">
        {/* Handle */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-xl font-bold tracking-tight text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 gap-3 sm:grid-cols-3">
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => onSelect(player)}
              className="flex items-center p-3 rounded-2xl bg-gray-50 border border-gray-100 active:bg-blue-50 active:border-blue-200 active:scale-95 transition-all text-left group"
            >
              <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center mr-3 text-sm group-active:bg-blue-200 group-active:text-blue-700">
                {player.number}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="font-semibold text-gray-900 truncate">{player.name}</div>
                <div className="text-xs text-gray-500">{player.gender}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};