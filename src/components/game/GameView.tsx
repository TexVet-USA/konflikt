import React, { useState } from 'react';
import CircularBoard from './CircularBoard';
import DiceArea from './DiceArea';
import PlayerPanel from './PlayerPanel';
import GameHeader from './GameHeader';
import RulesModal from './RulesModal';
import WinnerModal from './WinnerModal';
import { useGame } from '@/lib/GameContext';
import { PLAYER_COLORS } from '@/lib/gameTypes';

const GameView: React.FC = () => {
  const [rulesOpen, setRulesOpen] = useState(false);
  const { state } = useGame();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <GameHeader onOpenRules={() => setRulesOpen(true)} />

      <div className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-4 p-3 lg:p-5 max-w-[1400px] mx-auto w-full">
        {/* Left panel - White player */}
        <div className="w-full lg:w-64 xl:w-72 order-2 lg:order-1 flex flex-col gap-3">
          <PlayerPanel player="white" />
          
          {/* Move log */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Move Log
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
              {state.turnMoves.length === 0 && state.moveHistory.length === 0 ? (
                <p className="text-slate-600 italic">No moves yet</p>
              ) : (
                <>
                  {state.moveHistory.slice(-5).map((record, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-slate-400">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_COLORS[record.player].main }} />
                      <span>
                        [{record.dice[0]},{record.dice[1]}]
                        {record.moves.map((m, j) => (
                          <span key={j} className="ml-1">
                            {m.from === 'well' ? 'W' : m.from === 'pit' ? 'P' : (m.from as number) + 1}
                            →{m.to === 'off' ? 'OFF' : (m.to as number) + 1}
                            {m.hitOpponent && <span className="text-red-400"> HIT</span>}

                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                  {state.turnMoves.map((m, i) => (
                    <div key={`t-${i}`} className="flex items-center gap-1.5 text-white font-medium">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_COLORS[m.player].main }} />
                      <span>
                        {m.from === 'well' ? 'Well' : m.from === 'pit' ? 'Pit' : `Sp ${(m.from as number) + 1}`}
                        → {m.to === 'off' ? 'OFF' : `Sp ${(m.to as number) + 1}`}
                        {m.hitOpponent && ' (HIT!)'}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center - Board and Dice */}
        <div className="flex-1 flex flex-col items-center gap-3 order-1 lg:order-2 w-full max-w-[650px]">
          <div className="w-full aspect-square">
            <CircularBoard />
          </div>
          <DiceArea />
        </div>

        {/* Right panel - Blue player */}
        <div className="w-full lg:w-64 xl:w-72 order-3 flex flex-col gap-3">
          <PlayerPanel player="black" />

          {/* Quick help */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              How to Play
            </h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold mt-0.5">1.</span>
                <span>Click your <strong className="text-slate-300">Well</strong> or a piece on the board to select</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-green-400 font-bold mt-0.5">2.</span>
                <span><span className="text-green-400">Green spaces</span> show valid moves — click to move</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400 font-bold mt-0.5">3.</span>
                <span>Pieces in <span className="text-purple-400">THE PIT</span> must move first</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-yellow-400 font-bold mt-0.5">4.</span>
                <span><span className="text-yellow-400">Doubles</span> = 4 moves + 4 complement + re-roll!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950 py-3 px-4 text-center">
        <p className="text-xs text-slate-600">
          Konflikt — Russian Backgammon on a Round Board • "Ya Neva' Give Up!"
        </p>
      </footer>

      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
      <WinnerModal />
    </div>
  );
};

export default GameView;
