import React, { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import type { Player } from '@/lib/gameTypes';

const SandboxControls: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<Player>('white');
  const [die1, setDie1] = useState(1);
  const [die2, setDie2] = useState(1);

  const addPiece = (spaceIndex: number | 'well' | 'pit') => {
    const action = { 
      type: 'SANDBOX_ADD_PIECE', 
      space: spaceIndex, 
      player: selectedPlayer 
    };
    dispatch(action as any);
  };

  const removePiece = (spaceIndex: number | 'well' | 'pit') => {
    const action = { 
      type: 'SANDBOX_REMOVE_PIECE', 
      space: spaceIndex, 
      player: selectedPlayer 
    };
    dispatch(action as any);
  };

  const setDice = () => {
    dispatch({ type: 'SANDBOX_SET_DICE', dice: [die1, die2] } as any);
  };

  const setPhase = (phase: string) => {
    dispatch({ type: 'SANDBOX_SET_PHASE', phase } as any);
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-slate-900/95 border border-purple-500/50 rounded-xl p-4 max-w-xs shadow-2xl">
      <h3 className="text-purple-400 font-bold text-sm mb-3">🔧 Sandbox Controls</h3>
      
      {/* Player selection */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-1">Edit pieces for:</p>
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedPlayer('white')}
            className={`px-3 py-1 rounded text-xs font-bold ${selectedPlayer === 'white' ? 'bg-white text-black' : 'bg-slate-700 text-slate-400'}`}
          >
            White
          </button>
          <button 
            onClick={() => setSelectedPlayer('black')}
            className={`px-3 py-1 rounded text-xs font-bold ${selectedPlayer === 'black' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
          >
            Blue
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-1">Quick:</p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => addPiece('well')} className="px-2 py-1 bg-green-700/50 text-green-300 rounded text-xs">+Well</button>
          <button onClick={() => removePiece('well')} className="px-2 py-1 bg-red-700/50 text-red-300 rounded text-xs">-Well</button>
          <button onClick={() => addPiece('pit')} className="px-2 py-1 bg-green-700/50 text-green-300 rounded text-xs">+Pit</button>
          <button onClick={() => removePiece('pit')} className="px-2 py-1 bg-red-700/50 text-red-300 rounded text-xs">-Pit</button>
        </div>
      </div>

      {/* Dice control */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-1">Set Dice:</p>
        <div className="flex gap-2 items-center">
          <select value={die1} onChange={(e) => setDie1(Number(e.target.value))} className="bg-slate-800 text-white text-xs p-1 rounded">
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="text-slate-500">+</span>
          <select value={die2} onChange={(e) => setDie2(Number(e.target.value))} className="bg-slate-800 text-white text-xs p-1 rounded">
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button onClick={setDice} className="px-3 py-1 bg-purple-600 text-white rounded text-xs">Set</button>
        </div>
      </div>

      {/* Phase control */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-1">Phase:</p>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setPhase('rolling')} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Roll</button>
          <button onClick={() => setPhase('moving')} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Move</button>
        </div>
      </div>

      {/* Reset */}
      <button 
        onClick={() => dispatch({ type: 'NEW_GAME' } as any)}
        className="w-full py-2 bg-red-600/50 text-red-300 rounded text-xs hover:bg-red-600/70"
      >
        Reset Board
      </button>
    </div>
  );
};

export default SandboxControls;