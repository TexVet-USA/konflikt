export type Player = 'white' | 'black';

export interface Space {
  white: number;
  black: number;
}

export type GamePhase = 
  | 'pre-game'
  | 'initial-roll'
  | 'rolling'
  | 'moving'
  | 'game-over';

export type DoublesPhase = 
  | 'first'
  | 'complement'
  | 'reroll'
  | null;

export interface DiceState {
  values: [number, number];
  rolled: boolean;
}

export interface GameState {
  board: Space[];           // 24 spaces (index 0 = space 1, index 23 = space 24)
  well: { white: number; black: number };   // pieces not yet entered
  pit: { white: number; black: number };    // pieces hit, in center
  borneOff: { white: number; black: number }; // pieces removed
  currentPlayer: Player;
  dice: DiceState;
  remainingMoves: number[];  // die values still available
  phase: GamePhase;
  doublesPhase: DoublesPhase;
  selectedSpace: number | null; // -1 = well/pit, 0-23 = board space
  validMoves: number[];        // valid destination spaces for selected piece
  winner: Player | null;
  message: string;
  moveHistory: MoveRecord[];
  turnMoves: SingleMove[];     // moves made this turn (for undo)
}

export interface SingleMove {
  from: number | 'well' | 'pit';
  to: number | 'off';
  player: Player;
  dieUsed: number;
  hitOpponent: boolean;
  prevState: GameState | null; // for undo
}

export interface MoveRecord {
  player: Player;
  dice: [number, number];
  moves: SingleMove[];
}

// Board layout constants for circular rendering
export const TOTAL_SPACES = 24;
export const ENTRY_SPACES = [0, 1, 2, 3, 4, 5]; // spaces 1-6 (indices 0-5)
export const EXIT_SPACES = [18, 19, 20, 21, 22, 23]; // spaces 19-24 (indices 18-23)
export const PIECES_PER_PLAYER = 15;

export const PLAYER_COLORS = {
  white: { main: '#FFFFFF', light: '#F0F0F0', dark: '#CCCCCC', name: 'White' },
  black: { main: '#2563EB', light: '#60A5F9', dark: '#1D4ED8', name: 'Blue' },
} as const;
