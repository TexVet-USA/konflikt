import {
  GameState, Player, TOTAL_SPACES
} from './gameTypes';
import {
  getValidMoves, executeMove, getDieForMove, hasAnyValidMove,
  wouldHit, allInExitCourt, isBlocked
} from './gameEngine';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

interface PossibleMove {
  from: number | 'well' | 'pit';
  to: number | 'off';
  dieUsed: number;
  score: number;
}

// Get all possible moves for the current player
function getAllPossibleMoves(state: GameState): PossibleMove[] {
  const player = state.currentPlayer;
  const moves: PossibleMove[] = [];

  const sources: (number | 'well' | 'pit')[] = [];

  // Must move from pit first
  if (state.pit[player] > 0) {
    sources.push('pit');
  } else {
    if (state.well[player] > 0) sources.push('well');
    for (let i = 0; i < TOTAL_SPACES; i++) {
      if (state.board[i][player] > 0) sources.push(i);
    }
  }

  for (const from of sources) {
    const dests = getValidMoves(state, from, player, state.remainingMoves);
    for (const dest of dests) {
      const to: number | 'off' = dest === -1 ? 'off' : dest;
      const dieUsed = getDieForMove(from, to);
      if (state.remainingMoves.includes(dieUsed)) {
        moves.push({ from, to, dieUsed, score: 0 });
      }
    }
  }

  return moves;
}

// Easy: pick a random valid move
function pickEasyMove(state: GameState): PossibleMove | null {
  const moves = getAllPossibleMoves(state);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

// Score a move for medium difficulty
function scoreMedium(state: GameState, move: PossibleMove): number {
  const player = state.currentPlayer;
  const opponent: Player = player === 'white' ? 'black' : 'white';
  let score = 0;

  // Prefer bearing off
  if (move.to === 'off') score += 50;

  // Prefer entering from well/pit
  if (move.from === 'well') score += 10;
  if (move.from === 'pit') score += 30; // high priority to get out of pit

  if (typeof move.to === 'number') {
    // Prefer hitting opponent
    if (state.board[move.to][opponent] === 1) score += 20;

    // Prefer making pairs (landing where we already have 1 piece)
    if (state.board[move.to][player] === 1) score += 15;

    // Prefer advancing pieces further
    score += move.to * 0.5;

    // Avoid leaving pieces alone (check if source will be alone after move)
    if (typeof move.from === 'number' && state.board[move.from][player] === 2) {
      score -= 5; // breaking a pair
    }
  }

  // Small randomness
  score += Math.random() * 3;

  return score;
}

// Score a move for hard difficulty
function scoreHard(state: GameState, move: PossibleMove): number {
  const player = state.currentPlayer;
  const opponent: Player = player === 'white' ? 'black' : 'white';
  let score = 0;

  // Bearing off is top priority
  if (move.to === 'off') score += 100;

  // Getting out of pit is critical
  if (move.from === 'pit') score += 60;

  // Entering from well
  if (move.from === 'well') score += 8;

  if (typeof move.to === 'number') {
    const dest = move.to;

    // Hitting opponent pieces - very valuable, especially late game
    if (state.board[dest][opponent] === 1) {
      score += 35;
      // Even more valuable if opponent is far along
      if (dest >= 12) score += 15;
      // Hitting in exit court is devastating
      if (dest >= 18) score += 20;
    }

    // Building barriers (making pairs or stacks)
    const myPiecesAtDest = state.board[dest][player];
    if (myPiecesAtDest === 1) score += 25; // making a pair = protection
    if (myPiecesAtDest >= 2) score += 5; // stacking on protected space

    // Building consecutive barriers (blocking opponent)
    let consecutiveBlocked = 0;
    for (let check = Math.max(0, dest - 3); check <= Math.min(TOTAL_SPACES - 1, dest + 3); check++) {
      if (state.board[check][player] >= 2 || (check === dest && myPiecesAtDest >= 1)) {
        consecutiveBlocked++;
      }
    }
    score += consecutiveBlocked * 4;

    // Advance pieces toward exit court
    score += dest * 0.8;

    // Prefer positions in front of opponent pieces
    for (let i = dest + 1; i < Math.min(dest + 7, TOTAL_SPACES); i++) {
      if (state.board[i][opponent] > 0) {
        score += 3; // blocking opponent's path
      }
    }

    // Penalize leaving single pieces vulnerable
    if (typeof move.from === 'number') {
      const remainingAtSource = state.board[move.from][player] - 1;
      if (remainingAtSource === 1) {
        // Check if opponent can reach this space
        let vulnerable = false;
        for (let d = 1; d <= 6; d++) {
          const oppFrom = move.from - d;
          if (oppFrom >= 0 && state.board[oppFrom][opponent] > 0) {
            vulnerable = true;
            break;
          }
        }
        if (vulnerable) score -= 12;
      }
    }

    // Penalize landing alone on a space near opponent
    if (myPiecesAtDest === 0) {
      let nearOpponent = false;
      for (let d = 1; d <= 6; d++) {
        const oppFrom = dest - d;
        if (oppFrom >= 0 && state.board[oppFrom][opponent] > 0) {
          nearOpponent = true;
          break;
        }
      }
      if (nearOpponent) score -= 8;
    }

    // If all in exit court, prefer moving highest pieces down
    if (allInExitCourt(state, player) && typeof move.from === 'number') {
      score += (move.from - 17) * 2; // prioritize moving pieces from higher positions
    }
  }

  // Small randomness to avoid predictability
  score += Math.random() * 2;

  return score;
}

// Pick the best move based on difficulty
function pickMove(state: GameState, difficulty: AIDifficulty): PossibleMove | null {
  if (difficulty === 'easy') return pickEasyMove(state);

  const moves = getAllPossibleMoves(state);
  if (moves.length === 0) return null;

  const scoreFn = difficulty === 'hard' ? scoreHard : scoreMedium;

  // Score all moves
  for (const move of moves) {
    move.score = scoreFn(state, move);
  }

  // Sort by score descending
  moves.sort((a, b) => b.score - a.score);

  // For medium, sometimes pick second-best (30% chance)
  if (difficulty === 'medium' && moves.length > 1 && Math.random() < 0.3) {
    return moves[1];
  }

  return moves[0];
}

// Execute a full AI turn: make all moves sequentially
// Returns array of states (one per move) for animation
export function getAIMove(state: GameState, difficulty: AIDifficulty): { from: number | 'well' | 'pit'; to: number | 'off'; dieUsed: number } | null {
  if (!hasAnyValidMove(state, state.currentPlayer, state.remainingMoves)) {
    return null;
  }

  const move = pickMove(state, difficulty);
  if (!move) return null;

  return { from: move.from, to: move.to, dieUsed: move.dieUsed };
}
