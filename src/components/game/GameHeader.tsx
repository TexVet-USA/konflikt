import React from 'react';
import { useGame } from '@/lib/GameContext';

interface GameHeaderProps {
  onOpenRules: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ onOpenRules }) => {
  const { state, newGame, gameMode, aiDifficulty, aiThinking, skipTurn, turnMoves, remainingMoves } = useGame();

  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">
              KONFLIKT
            </h1>
            <p className="text-[10px] text-slate-400 tracking-widest uppercase">
              {gameMode === 'pvc' ? `vs AI (${aiDifficulty})` : 'Local Multiplayer'}
            </p>
          </div>
        </div>

        {/* Center message */}
        <div className="hidden md:flex items-center gap-2">
          {aiThinking && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/40 border border-amber-600/40 rounded-lg">
              <svg className="animate-spin h-3.5 w-3.5 text-amber-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs text-amber-400 font-semibold">AI Thinking...</span>
            </div>
          )}
          <div className="px-4 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 max-w-md">
            <p className="text-sm text-slate-300 text-center truncate">
              {state.message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRules}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
            <span className="hidden sm:inline">Rules</span>
          </button>
          <button
            onClick={newGame}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0115-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 01-15 6.7L3 16" />
            </svg>
            <span className="hidden sm:inline">New Game</span>
          </button>
        </div>
      </div>

      {/* Mobile message bar */}
      <div className="md:hidden px-4 pb-2">
        <div className="flex items-center gap-2">
          {aiThinking && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-900/40 border border-amber-600/40 rounded-lg shrink-0">
              <svg className="animate-spin h-3 w-3 text-amber-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-[10px] text-amber-400 font-semibold">AI</span>
            </div>
          )}
          <div className="flex-1 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-300 text-center">
              {state.message}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
