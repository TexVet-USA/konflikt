import React, { useState, useCallback } from 'react';
import { useGame } from '@/lib/GameContext';

const DiceFace: React.FC<{ value: number; color?: string; size?: number }> = ({
  value,
  color = '#F8FAFC',
  size = 64,
}) => {
  const dotPositions: Record<number, [number, number][]> = {
    1: [[0.5, 0.5]],
    2: [[0.25, 0.25], [0.75, 0.75]],
    3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
    5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
    6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
  };

  const dots = dotPositions[value] || [];
  const dotR = size * 0.08;

  return (
    <div
      className="relative rounded-xl shadow-lg border-2 border-slate-600"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      }}
    >
      {dots.map(([x, y], i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: dotR * 2,
            height: dotR * 2,
            left: x * size - dotR,
            top: y * size - dotR,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}40`,
          }}
        />
      ))}
    </div>
  );
};

const DiceArea: React.FC = () => {
  const { state, initialRoll, rollDiceAction, isAITurn, aiThinking } = useGame();
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = useCallback(() => {
    if (isAITurn) return; // Don't allow manual roll during AI turn
    setIsRolling(true);
    setTimeout(() => {
      if (state.phase === 'initial-roll') {
        initialRoll();
      } else {
        rollDiceAction();
      }
      setIsRolling(false);
    }, 600);
  }, [state.phase, initialRoll, rollDiceAction, isAITurn]);

  const canRoll =
    !isAITurn && (
      state.phase === 'initial-roll' ||
      state.phase === 'rolling' ||
      (state.doublesPhase === 'reroll' && state.phase === 'rolling')
    );

  const showDice = state.dice.rolled && state.dice.values[0] > 0;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Dice display */}
      <div className="flex items-center gap-4">
        {showDice ? (
          <>
            <div className={isRolling || aiThinking ? 'animate-spin' : ''}>
              <DiceFace value={state.dice.values[0]} color="#F8FAFC" size={56} />
            </div>
            <div className={isRolling || aiThinking ? 'animate-spin' : ''}>
              <DiceFace value={state.dice.values[1]} color="#F8FAFC" size={56} />
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center">
              <span className="text-slate-500 text-lg">?</span>
            </div>
            <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center">
              <span className="text-slate-500 text-lg">?</span>
            </div>
          </>
        )}
      </div>

      {/* Remaining moves */}
      {state.remainingMoves.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Remaining:</span>
          <div className="flex gap-1">
            {state.remainingMoves.map((m, i) => (
              <span
                key={i}
                className="w-7 h-7 rounded-md bg-slate-700 border border-slate-500 flex items-center justify-center text-sm font-bold text-white"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Roll button - hidden during AI turn */}
      {canRoll && (
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {isRolling ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Rolling...
            </span>
          ) : state.phase === 'initial-roll' ? (
            'Roll to Start'
          ) : state.doublesPhase === 'reroll' ? (
            'Bonus Roll!'
          ) : (
            'Roll Dice'
          )}
        </button>
      )}

      {/* AI thinking indicator in dice area */}
      {isAITurn && aiThinking && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/30 border border-amber-700/40 rounded-xl">
          <svg className="animate-spin h-4 w-4 text-amber-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-amber-400 font-semibold">AI is thinking...</span>
        </div>
      )}

      {/* Doubles indicator */}
      {state.doublesPhase && (
        <div className="px-4 py-1.5 bg-yellow-900/40 border border-yellow-600/50 rounded-lg">
          <span className="text-yellow-400 text-xs font-semibold">
            {state.doublesPhase === 'first' && 'DOUBLES - First Set'}
            {state.doublesPhase === 'complement' && 'DOUBLES - Complement Set'}
            {state.doublesPhase === 'reroll' && 'DOUBLES - Bonus Roll!'}
          </span>
        </div>
      )}
    </div>
  );
};

export default DiceArea;
