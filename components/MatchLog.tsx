
import React from 'react';
import { GameEvent, EventType, Player } from '../types';
import { FIELD_DIMENSIONS } from '../constants';
import { ArrowRight, Clock, MapPin, XCircle, Trophy, Disc } from 'lucide-react';

interface MatchLogProps {
  events: GameEvent[];
  players: Player[];
}

export const MatchLog: React.FC<MatchLogProps> = ({ events, players }) => {
  const getPlayer = (id?: string) => players.find(p => p.id === id);

  const calculateStats = (current: GameEvent, prev: GameEvent | null) => {
    if (!prev) return { dist: 0, time: 0 };
    
    // Distance in Meters
    const dx = Math.abs(current.location.x - prev.location.x) * (FIELD_DIMENSIONS.width / 100);
    const dy = Math.abs(current.location.y - prev.location.y) * (FIELD_DIMENSIONS.length / 100);
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Forward Progress (Net Y gain) - assuming Home goes Up (0->100) and Away goes Down (100->0) usually, 
    // but simplified here to just Y delta.
    const gain = (current.location.y - prev.location.y) * (FIELD_DIMENSIONS.length / 100);

    // Time
    const time = (current.timestamp - prev.timestamp) / 1000;

    return { dist: Math.round(dist * 10) / 10, time: Math.round(time * 10) / 10, gain: Math.round(gain * 10) / 10 };
  };

  const processedEvents = events.map((event, i) => {
    const prev = i > 0 ? events[i-1] : null;
    const stats = calculateStats(event, prev);
    // Reset stats if there was a turnover or goal previously, or if this is a pickup
    const isFlowContinuation = prev && prev.type === EventType.CATCH && event.type !== EventType.PULL && event.type !== EventType.PICKUP;
    
    return { ...event, stats: isFlowContinuation ? stats : null };
  }).reverse(); // Newest first

  return (
    <div className="space-y-4">
      {processedEvents.map((event) => {
        const thrower = getPlayer(event.throwerId);
        const receiver = getPlayer(event.receiverId);
        const isGoal = event.type === EventType.GOAL;
        const isTurn = event.type === EventType.DROP || event.type === EventType.THROWAWAY;
        const isPickup = event.type === EventType.PICKUP;

        return (
          <div key={event.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
            {/* Header: Event Type & Time */}
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${isGoal ? 'text-yellow-600' : isTurn ? 'text-red-500' : isPickup ? 'text-green-600' : 'text-blue-600'}`}>
                    {isGoal && <Trophy size={14} />}
                    {isTurn && <XCircle size={14} />}
                    {isPickup && <Disc size={14} />}
                    {event.type.replace('_', ' ')}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                    {new Date(event.timestamp).toLocaleTimeString([], {minute: '2-digit', second:'2-digit'})}
                </div>
            </div>

            {/* Content: Who -> Who */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isPickup ? (
                        <>
                            <span className="text-slate-500 text-sm">Picked up by</span>
                            <span className="font-semibold text-slate-800">{receiver?.name || thrower?.name || 'Unknown'}</span>
                        </>
                    ) : (
                        <>
                            <span className="font-semibold text-slate-800">{thrower?.name || 'Unknown'}</span>
                            <ArrowRight size={16} className="text-slate-300" />
                            <span className={receiver ? 'font-semibold text-slate-800' : 'text-slate-400 italic'}>
                                {receiver?.name || (isTurn ? 'Turnover' : '---')}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Footer: Stats */}
            {event.stats && (
                <div className="flex items-center gap-4 mt-1 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={12} />
                        <span>{event.stats.dist}m</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock size={12} />
                        <span>{event.stats.time}s hold</span>
                    </div>
                </div>
            )}
          </div>
        );
      })}
      
      {processedEvents.length === 0 && (
          <div className="text-center py-10 text-slate-400">No events recorded yet.</div>
      )}
    </div>
  );
};
