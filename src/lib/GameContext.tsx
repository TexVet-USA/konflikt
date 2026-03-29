import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState } from 'react';
import {
  GameState, Player,
} from './gameTypes';
import {
  createInitialState,
  rollDice,
  processInitialRoll,
  processDiceRoll,
  getValidMoves,
  executeMove,
  getDieForMove,
  hasAnyValidMove,
} from './gameEngine';
import { getAIMove, AIDifficulty } from './aiEngine';

export type GameMode = 'pvp' | 'pvc';

type GameAction =
  | { type: 'NEW_GAME' }
  | { type: 'INITIAL_ROLL' }
  | { type: 'ROLL_DICE' }
  | { type: 'SELECT_SPACE'; space: number | 'well' | 'pit' }
  | { type: 'MOVE_TO'; destination: number | 'off' }
  | { type: 'DESELECT' }
  | { type: 'SET_STATE'; state: GameState }
  | { type: 'AI_MOVE'; from: number | 'well' | 'pit'; to: number | 'off'; dieUsed: number }
  | { type: 'PASS_TURN' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return {
        ...createInitialState(),
        phase: 'initial-roll',
        message: 'Each player rolls one die. Click "Roll" to determine who goes first!',
      };

    case 'INITIAL_ROLL':
      return processInitialRoll(state);

    case 'ROLL_DICE': {
      const dice = rollDice();
      return processDiceRoll(state, dice);
    }

    case 'SELECT_SPACE': {
      const { space } = action;
      const player = state.currentPlayer;

      let from: number | 'well' | 'pit';
      if (space === 'well') {
        if (state.well[player] <= 0) return state;
        if (state.pit[player] > 0) return { ...state, message: 'You must move your piece from THE PIT first!' };
        from = 'well';
      } else if (space === 'pit') {
        if (state.pit[player] <= 0) return state;
        from = 'pit';
      } else {
        if (state.pit[player] > 0) return { ...state, message: 'You must move your piece from THE PIT first!' };
        if (state.board[space][player] <= 0) return state;
        from = space;
      }

      const valid = getValidMoves(state, from, player, state.remainingMoves);
      
      if (valid.length === 0) {
        // Check if player has ANY valid move - if not, auto-pass turn
        if (!hasAnyValidMove(state, player, state.remainingMoves)) {
          const opponent: Player = player === 'white' ? 'black' : 'white';
          return {
            ...state,
            selectedSpace: null,
            validMoves: [],
            currentPlayer: opponent,
            phase: 'rolling',
            remainingMoves: [],
            turnMoves: [],
            doublesPhase: null,
            message: `No valid moves! Turn passes to ${opponent === 'white' ? 'White' : 'Blue'}. Roll the dice!`
          };
        }
        return { ...state, selectedSpace: null, validMoves: [], message: 'No valid moves from this position.' };
      }

      return {
        ...state,
        selectedSpace: space === 'well' ? -1 : space === 'pit' ? -2 : space,
        validMoves: valid,
      };
    }

    case 'MOVE_TO': {
      const { destination } = action;
      
      let from: number | 'well' | 'pit';
      if (state.selectedSpace === -1) from = 'well';
      else if (state.selectedSpace === -2) from = 'pit';
      else from = state.selectedSpace!;

      const to: number | 'off' = destination === -1 ? 'off' : destination;
      const dieUsed = getDieForMove(from, to);

      if (!state.remainingMoves.includes(dieUsed)) {
        return { ...state, message: 'Invalid move - die value not available.' };
      }

      return executeMove(state, from, to, dieUsed);
    }

    case 'AI_MOVE': {
      const { from, to, dieUsed } = action;
      if (!state.remainingMoves.includes(dieUsed)) return state;
      return executeMove(state, from, to, dieUsed);
    }

    case 'PASS_TURN': {
      // Auto-pass turn when no valid moves available
      const opponent: Player = state.currentPlayer === 'white' ? 'black' : 'white';
      return {
        ...state,
        currentPlayer: opponent,
        phase: 'rolling',
        remainingMoves: [],
        turnMoves: [],
        doublesPhase: null,
        selectedSpace: null,
        validMoves: [],
        message: `No valid moves! Turn passes to ${opponent === 'white' ? 'White' : 'Blue'}. Roll the dice!`
      };
    }

    case 'DESELECT':
      return { ...state, selectedSpace: null, validMoves: [] };

    case 'SET_STATE':
      return action.state;

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  newGame: () => void;
  startGame: (mode: GameMode, difficulty: AIDifficulty) => void;
  initialRoll: () => void;
  rollDiceAction: () => void;
  selectSpace: (space: number | 'well' | 'pit') => void;
  moveTo: (destination: number | 'off') => void;
  deselect: () => void;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  isAITurn: boolean;
  aiThinking: boolean;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [aiThinking, setAiThinking] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const aiPlayer: Player = 'black'; // AI always plays as Blue
  const isAITurn = gameMode === 'pvc' && state.currentPlayer === aiPlayer && state.phase !== 'pre-game' && state.phase !== 'game-over';

  const newGame = useCallback(() => dispatch({ type: 'NEW_GAME' }), []);

  const startGame = useCallback((mode: GameMode, difficulty: AIDifficulty) => {
    setGameMode(mode);
    setAiDifficulty(difficulty);
    dispatch({ type: 'NEW_GAME' });
  }, []);

  const initialRoll = useCallback(() => dispatch({ type: 'INITIAL_ROLL' }), []);
  const rollDiceAction = useCallback(() => dispatch({ type: 'ROLL_DICE' }), []);
  const selectSpace = useCallback((space: number | 'well' | 'pit') => dispatch({ type: 'SELECT_SPACE', space }), []);
  const moveTo = useCallback((destination: number | 'off') => dispatch({ type: 'MOVE_TO', destination }), []);
  const deselect = useCallback(() => dispatch({ type: 'DESELECT' }), []);

  // AI auto-play logic
  useEffect(() => {
    if (!isAITurn) {
      setAiThinking(false);
      return;
    }

    // AI needs to roll
    if (state.phase === 'initial-roll' || state.phase === 'rolling') {
      setAiThinking(true);
      aiTimerRef.current = setTimeout(() => {
        if (state.phase === 'initial-roll') {
          dispatch({ type: 'INITIAL_ROLL' });
        } else {
          dispatch({ type: 'ROLL_DICE' });
        }
        setAiThinking(false);
      }, 800);
      return;
    }

    // AI needs to move
    if (state.phase === 'moving' && state.remainingMoves.length > 0) {
      setAiThinking(true);
      const delay = aiDifficulty === 'easy' ? 400 : aiDifficulty === 'medium' ? 600 : 900;
      aiTimerRef.current = setTimeout(() => {
        const move = getAIMove(state, aiDifficulty);
        if (move) {
          dispatch({ type: 'AI_MOVE', from: move.from, to: move.to, dieUsed: move.dieUsed });
        } else {
          // AI has no valid moves - auto-pass turn
          dispatch({ type: 'PASS_TURN' });
        }
        setAiThinking(false);
      }, delay);
      return;
    }

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [isAITurn, state.phase, state.remainingMoves.length, state.currentPlayer, aiDifficulty, state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, []);

  return (
    <GameContext.Provider value={{
      state, dispatch, newGame, startGame, initialRoll, rollDiceAction,
      selectSpace, moveTo, deselect, gameMode, aiDifficulty, isAITurn, aiThinking,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
