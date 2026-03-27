import React from 'react';
import { useGame } from '@/lib/GameContext';
import { PLAYER_COLORS, Player, PIECES_PER_PLAYER } from '@/lib/gameTypes';

interface PlayerPanelProps {
  player: Player;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ player }) => {
  const { state, selectSpace, gameMode, aiDifficulty } = useGame();
  const colors = PLAYER_COLORS[player];
  const isActive = state.currentPlayer === player && state.phase === 'moving';
  const wellCount = state.well[player];
  const pitCount = state.pit[player];
  const borneOff = state.borneOff[player];
  const onBoard = PIECES_PER_PLAYER - wellCount - pitCount - borneOff;
  const isAI = gameMode === 'pvc' && player === 'black';

  const handleWellClick = () => {
    if (isActive && wellCount > 0 && !isAI) {
      selectSpace('well');
    }
  };

  const isWellSelected = state.selectedSpace === -1 && state.currentPlayer === player;

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
        isActive
          ? 'border-opacity-100 shadow-lg shadow-current/20'
          : 'border-opacity-30 opacity-70'
      }`}
      style={{
        borderColor: colors.main,
        background: `linear-gradient(135deg, ${colors.dark}15, ${colors.main}08)`,
      }}
    >
      {/* Player name and indicator */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
            isActive ? 'animate-pulse' : ''
          }`}
          style={{ backgroundColor: colors.main }}
        >
          {isAI ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 9h.01" />
              <path d="M15 9h.01" />
              <path d="M9 15c.83.67 1.83 1 3 1s2.17-.33 3-1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: colors.main }}>
            {colors.name}
            {isAI && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold uppercase">
                AI {aiDifficulty}
              </span>
            )}
          </h3>
          {isActive && (
            <span className="text-xs text-green-400 font-semibold">
              {isAI ? 'AI Turn' : 'Your Turn'}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        {/* Well (pieces to enter) */}
        <div
          className={`flex items-center justify-between p-2 rounded-lg transition-all ${
            isWellSelected
              ? 'bg-blue-500/20 border border-blue-500'
              : isActive && wellCount > 0 && !isAI
              ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-transparent cursor-pointer'
              : 'bg-slate-800/30 border border-transparent'
          }`}
          onClick={handleWellClick}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
            </svg>
            <span className="text-sm text-slate-300">Well</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(wellCount, 5) }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: colors.main, borderColor: colors.dark }}
              />
            ))}
            {wellCount > 5 && (
              <span className="text-xs text-slate-400 ml-1">+{wellCount - 5}</span>
            )}
            <span className="text-sm font-bold text-white ml-2">{wellCount}</span>
          </div>
        </div>

        {/* On Board */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-sm text-slate-300">On Board</span>
          </div>
          <span className="text-sm font-bold text-white">{onBoard}</span>
        </div>

        {/* In Pit */}
        {pitCount > 0 && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-red-900/20 border border-red-800/30">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span className="text-sm text-red-400">In Pit</span>
            </div>
            <span className="text-sm font-bold text-red-400">{pitCount}</span>
          </div>
        )}

        {/* Borne Off */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-green-900/20 border border-green-800/30">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-sm text-green-400">Borne Off</span>
          </div>
          <span className="text-sm font-bold text-green-400">{borneOff} / {PIECES_PER_PLAYER}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(borneOff / PIECES_PER_PLAYER) * 100}%`,
                backgroundColor: colors.main,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPanel;
