import React, { useMemo } from 'react';
import { GameEvent, EventType, TeamSide } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { X, Trophy, Activity, History } from 'lucide-react';

interface StatsSummaryProps {
  events: GameEvent[];
  score: { home: number; away: number };
  onClose: () => void;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ events, score, onClose }) => {
  
  const stats = useMemo(() => {
    const totalPasses = events.filter(e => e.type === EventType.CATCH).length;
    const drops = events.filter(e => e.type === EventType.DROP).length;
    const throwaways = events.filter(e => e.type === EventType.THROWAWAY).length;
    const completionRate = totalPasses > 0 ? Math.round((totalPasses / (totalPasses + drops + throwaways)) * 100) : 100;
    
    // Simple Possession Calc (Events by side)
    const homeEvents = events.filter(e => e.possessionSide === 'home').length;
    const awayEvents = events.filter(e => e.possessionSide === 'away').length;
    const totalEvents = homeEvents + awayEvents || 1;
    
    return {
      totalPasses,
      drops,
      throwaways,
      completionRate,
      possessionData: [
        { name: 'Home', value: homeEvents },
        { name: 'Away', value: awayEvents },
      ]
    };
  }, [events]);

  const COLORS = ['#3b82f6', '#ef4444']; // Blue, Red

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
      <div className="p-6 pb-2 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Match Stats</h2>
        <button onClick={onClose} className="p-2 bg-white shadow-sm border rounded-full">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Scoreboard Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
           <div className="text-center">
             <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Home</div>
             <div className="text-4xl font-bold text-blue-600">{score.home}</div>
           </div>
           <div className="text-slate-300 text-2xl font-light">vs</div>
           <div className="text-center">
             <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Away</div>
             <div className="text-4xl font-bold text-red-500">{score.away}</div>
           </div>
        </div>

        {/* Primary Stat Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-blue-600 text-white p-5 rounded-3xl shadow-lg shadow-blue-500/20">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                 <Activity size={18} />
                 <span className="text-sm font-medium">Completion</span>
              </div>
              <div className="text-4xl font-bold">{stats.completionRate}%</div>
              <div className="text-xs mt-1 opacity-70">{stats.totalPasses} completed</div>
           </div>

           <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                 <History size={18} />
                 <span className="text-sm font-medium">Turnovers</span>
              </div>
              <div className="text-4xl font-bold text-slate-900">{stats.drops + stats.throwaways}</div>
              <div className="text-xs mt-1 text-slate-400">Drops & Throwaways</div>
           </div>
        </div>

        {/* Possession Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Possession Balance</h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.possessionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.possessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-blue-500"></div>
               <span className="text-sm text-slate-600">Home</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500"></div>
               <span className="text-sm text-slate-600">Away</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};