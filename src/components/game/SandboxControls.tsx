import React, { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import type { Player } from '@/lib/gameTypes';

// Preset scenarios for testing
const PRESETS = [
  { 
    name: '🧪 Bear Off Test', 
    setup: () => {
      // White pieces in exit court (19-24)
      const pieces = [
        { space: 18, count: 2 }, // space 19
        { space: 19, count: 2 }, // space 20
        { space: 20, count: 2 }, // space 21
        { space: 21, count: 2 }, // space 22
        { space: 22, count: 2 }, // space 23
        { space: 23, count: 2 }, // space 24
      ];
      return { pieces, dice: [1, 6] as [number, number], currentPlayer: 'white' as Player };
    }
  },
  { 
    name: '🚫 Blocked Test', 
    setup: () => {
      // Set up a blockade scenario
      const pieces = [
        { space: 0, count: 2 }, { space: 1, count: 2 }, { space: 2, count: 2 },
        { space: 3, count: 2 }, { space: 4, count: 2 }, { space: 5, count: 2 },
      ];
      return { pieces, dice: [1, 2] as [number, number], currentPlayer: 'black' as Player };
    }
  },
  { 
    name: '🎯 Hit/Blot Test', 
    setup: () => {
      // Position to test hitting blots
      const pieces = [
        { space: 0, count: 1 }, // White on space 1 (blot)
        { space: 5, count: 2 }, // Blue behind with 2s -> could hit
        { space: 'well' as any, count: 3 }, // Blue has pieces in well
      ];
      return { pieces, dice: [2, 2] as [number, number], currentPlayer: 'black' as Player };
    }
  },
  { 
    name: '⚔️ Doubles Test', 
    setup: () => {
      // Test doubles + complement
      const pieces = [
        { space: 0, count: 1 }, { space: 1, count: 1 }, { space: 2, count: 1 }, { space: 3, count: 1 },
      ];
      return { pieces, dice: [3, 3] as [number, number], currentPlayer: 'white' as Player };
    }
  },
  { 
    name: '🔄 Mid Game', 
    setup: () => {
      // Standard mid-game setup
      const pieces = [
        { space: 0, count: 2 }, { space: 5, count: 2 }, // Home board
        { space: 11, count: 1 }, { space: 16, count: 3 }, // Mid/outer
      ];
      return { pieces, dice: [4, 5] as [number, number], currentPlayer: 'white' as Player };
    }
  },
  { 
    name: '📋 Empty Board', 
    setup: () => {
      return { pieces: [] as any[], dice: [1, 1] as [number, number], currentPlayer: 'white' as Player };
    }
  },
];

const SandboxControls: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<Player>('white');
  const [die1, setDie1] = useState(1);
  const [die2, setDie2] = useState(1);

  // Apply preset
  const applyPreset = (preset: typeof PRESETS[0]) => {
    // Reset board first
    dispatch({ type: 'NEW_GAME' } as any);
    
    // Use timeout to ensure state resets first
    setTimeout(() => {
      const { pieces, dice, currentPlayer } = preset.setup();
      
      // Add pieces
      pieces.forEach((p: any) => {
        if (p.space === 'well') {
          for (let i = 0; i < p.count; i++) {
            dispatch({ type: 'SANDBOX_ADD_PIECE', space: 'well', player: currentPlayer } as any);
          }
        } else if (p.space === 'pit') {
          for (let i = 0; i < p.count; i++) {
            dispatch({ type: 'SANDBOX_ADD_PIECE', space: 'pit', player: currentPlayer } as any);
          }
        } else {
          for (let i = 0; i < p.count; i++) {
            dispatch({ type: 'SANDBOX_ADD_PIECE', space: p.space, player: currentPlayer } as any);
          }
        }
      });
      
      // Set dice and current player
      dispatch({ type: 'SANDBOX_SET_DICE', dice } as any);
      dispatch({ type: 'SANDBOX_SET_CURRENT_PLAYER', player: currentPlayer } as any);
    }, 100);
  };

  const setDice = () => {
    dispatch({ type: 'SANDBOX_SET_DICE', dice: [die1, die2] } as any);
  };

  const setCurrentPlayer = (player: Player) => {
    dispatch({ type: 'SANDBOX_SET_CURRENT_PLAYER', player } as any);
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-slate-900/95 border border-purple-500/50 rounded-xl p-4 max-w-xs shadow-2xl max-h-[80vh] overflow-y-auto">
      <h3 className="text-purple-400 font-bold text-sm mb-3">🔧 Sandbox Mode</h3>
      
      {/* Presets */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2">⚡ Quick Presets:</p>
        <div className="flex flex-col gap-1">
          {PRESETS.map((preset) => (
            <button 
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs text-left transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Player selection */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-1">Current Turn:</p>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentPlayer('white')}
            className={`px-3 py-1 rounded text-xs font-bold ${state.currentPlayer === 'white' ? 'bg-white text-black' : 'bg-slate-700 text-slate-400'}`}
          >
            White
          </button>
          <button 
            onClick={() => setCurrentPlayer('black')}
            className={`px-3 py-1 rounded text-xs font-bold ${state.currentPlayer === 'black' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
          >
            Blue
          </button>
        </div>
      </div>

      {/* Dice control */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-1">🎲 Set Dice:</p>
        <div className="flex gap-2 items-center">
          <select value={die1} onChange={(e) => setDie1(Number(e.target.value))} className="bg-slate-800 text-white text-xs p-1 rounded w-14">
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="text-slate-500">+</span>
          <select value={die2} onChange={(e) => setDie2(Number(e.target.value))} className="bg-slate-800 text-white text-xs p-1 rounded w-14">
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button onClick={setDice} className="px-3 py-1 bg-purple-600 text-white rounded text-xs">Set</button>
        </div>
      </div>

      {/* Roll button */}
      <div className="mb-3">
        <button 
          onClick={() => dispatch({ type: 'ROLL_DICE' } as any)}
          className="w-full py-2 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700"
        >
          🎲 Roll Dice
        </button>
      </div>

      {/* Add piece buttons */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-1">Add piece:</p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => dispatch({ type: 'SANDBOX_ADD_PIECE', space: 'well', player: state.currentPlayer } as any)} className="px-2 py-1 bg-green-700/50 text-green-300 rounded text-xs">+Well</button>
          <button onClick={() => dispatch({ type: 'SANDBOX_ADD_PIECE', space: 'pit', player: state.currentPlayer } as any)} className="px-2 py-1 bg-green-700/50 text-green-300 rounded text-xs">+Pit</button>
        </div>
      </div>

      {/* Reset */}
      <button 
        onClick={() => dispatch({ type: 'NEW_GAME' } as any)}
        className="w-full py-2 bg-red-600/50 text-red-300 rounded text-xs hover:bg-red-600/70"
      >
        🔄 Reset Board
      </button>

      {/* Instructions */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">💡 Click on any space, well, or pit to add/remove pieces for current player</p>
      </div>
    </div>
  );
};

export default SandboxControls;