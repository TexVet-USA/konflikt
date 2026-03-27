import React, { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import type { AIDifficulty } from '@/lib/aiEngine';
import type { GameMode } from '@/lib/GameContext';

const BG_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/69af1ac54d88bad2415c348f_1773083484818_7567fc6c.png';

const HeroSection: React.FC = () => {
  const { startGame } = useGame();
  const [selectedMode, setSelectedMode] = useState<GameMode>('pvc');
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('medium');

  const handleStart = () => {
    startGame(selectedMode, selectedDifficulty);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMAGE})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/95" />

      {/* Decorative circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full border border-purple-500/10 animate-spin" style={{ animationDuration: '60s' }} />
        <div className="absolute w-[450px] h-[450px] rounded-full border border-indigo-500/10 animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-purple-500/15 animate-spin" style={{ animationDuration: '30s' }} />
        <div className="absolute w-[150px] h-[150px] rounded-full bg-purple-600/10 animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-purple-900/50">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="6.76" y2="6.76" />
            <line x1="17.24" y1="17.24" x2="19.07" y2="19.07" />
            <line x1="4.93" y1="19.07" x2="6.76" y2="17.24" />
            <line x1="17.24" y1="6.76" x2="19.07" y2="4.93" />
          </svg>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter">
          KONFLIKT
        </h1>
        
        <p className="text-xl md:text-2xl text-purple-300 font-light mb-2">
          Russian Backgammon on a Round Board
        </p>

        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
          A strategic battle where fortunes change in a heartbeat. Build barriers, 
          hit opponents, and master the art of doubles. 
        </p>

        {/* Game Mode Selector */}
        <div className="max-w-md mx-auto mb-6">
          <div className="flex rounded-xl overflow-hidden border border-slate-600 bg-slate-800/60 backdrop-blur-sm">
            <button
              onClick={() => setSelectedMode('pvp')}
              className={`flex-1 py-3 px-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                selectedMode === 'pvp'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              vs Player
            </button>
            <button
              onClick={() => setSelectedMode('pvc')}
              className={`flex-1 py-3 px-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                selectedMode === 'pvc'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M9 9h.01" />
                <path d="M15 9h.01" />
                <path d="M9 15c.83.67 1.83 1 3 1s2.17-.33 3-1" />
              </svg>
              vs Computer
            </button>
          </div>
        </div>

        {/* Difficulty Selector (only for PvC) */}
        {selectedMode === 'pvc' && (
          <div className="max-w-md mx-auto mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-semibold">AI Difficulty</p>
            <div className="flex gap-3 justify-center">
              {([
                { key: 'easy' as AIDifficulty, label: 'Easy', desc: 'Random moves', color: 'from-green-600 to-emerald-600', border: 'border-green-500', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                )},
                { key: 'medium' as AIDifficulty, label: 'Medium', desc: 'Basic strategy', color: 'from-yellow-600 to-amber-600', border: 'border-yellow-500', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                  </svg>
                )},
                { key: 'hard' as AIDifficulty, label: 'Hard', desc: 'Advanced tactics', color: 'from-red-600 to-rose-600', border: 'border-red-500', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                )},
              ]).map((d) => (
                <button
                  key={d.key}
                  onClick={() => setSelectedDifficulty(d.key)}
                  className={`flex-1 py-3 px-3 rounded-xl border-2 transition-all ${
                    selectedDifficulty === d.key
                      ? `${d.border} bg-gradient-to-b ${d.color} text-white shadow-lg scale-105`
                      : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {d.icon}
                    <span className="text-sm font-bold">{d.label}</span>
                    <span className="text-[10px] opacity-70">{d.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-purple-900/40 transition-all active:scale-95 flex items-center gap-3 mx-auto"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          {selectedMode === 'pvc' ? `Play vs AI (${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)})` : 'Start Local Game'}
        </button>

        <p className="mt-8 text-yellow-400/80 text-sm font-semibold italic tracking-wide">
          "Ya Neva' Give Up!"
        </p>

        {/* Feature cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-red-600/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-sm">Hit & Recover</h3>
            <p className="text-slate-400 text-xs mt-1">Send opponents to THE PIT and force them to restart</p>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-yellow-600/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2">
                <rect x="2" y="2" width="8" height="8" rx="1" />
                <rect x="14" y="14" width="8" height="8" rx="1" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-sm">Doubles Power</h3>
            <p className="text-slate-400 text-xs mt-1">28 points of movement plus a bonus roll</p>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-green-600/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-sm">Round Board</h3>
            <p className="text-slate-400 text-xs mt-1">Unique circular battlefield with central PIT</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
