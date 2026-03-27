import React from 'react';
import { useGame } from '@/lib/GameContext';
import { PLAYER_COLORS } from '@/lib/gameTypes';

const WinnerModal: React.FC = () => {
  const { state, newGame } = useGame();

  if (state.phase !== 'game-over' || !state.winner) return null;

  const colors = PLAYER_COLORS[state.winner];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-500"
        style={{ borderColor: colors.main }}
      >
        {/* Trophy icon */}
        <div
          className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg"
          style={{ backgroundColor: colors.main + '20', border: `3px solid ${colors.main}` }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.main} strokeWidth="2">
            <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0012 0V2z" />
          </svg>
        </div>

        <h2 className="text-3xl font-black mb-2" style={{ color: colors.main }}>
          {colors.name} Wins!
        </h2>
        
        <p className="text-slate-400 text-lg mb-2">
          Victory is yours!
        </p>

        <p className="text-xl font-bold text-yellow-400 mb-8 italic">
          "Ya Neva' Give Up!"
        </p>

        <button
          onClick={newGame}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default WinnerModal;
