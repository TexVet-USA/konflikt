import {
  GameState, Player, Space, SingleMove,
  TOTAL_SPACES, PIECES_PER_PLAYER
} from './gameTypes';


export function createInitialState(): GameState {
  const board: Space[] = Array.from({ length: TOTAL_SPACES }, () => ({ white: 0, black: 0 }));
  return {
    board,
    well: { white: PIECES_PER_PLAYER, black: PIECES_PER_PLAYER },
    pit: { white: 0, black: 0 },
    borneOff: { white: 0, black: 0 },
    currentPlayer: 'white',
    dice: { values: [0, 0], rolled: false },
    remainingMoves: [],
    phase: 'pre-game',
    doublesPhase: null,
    selectedSpace: null,
    validMoves: [],
    winner: null,
    message: 'Welcome to Konflikt! Click "New Game" to start.',
    moveHistory: [],
    turnMoves: [],
  };
}

export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollDice(): [number, number] {
  return [rollDie(), rollDie()];
}

export function isDoubles(dice: [number, number]): boolean {
  return dice[0] === dice[1];
}

export function getComplement(n: number): number {
  return 7 - n;
}

// Check if all of a player's pieces are in the exit court (spaces 19-24, indices 18-23)
export function allInExitCourt(state: GameState, player: Player): boolean {
  if (state.well[player] > 0 || state.pit[player] > 0) return false;
  for (let i = 0; i < 18; i++) {
    if (state.board[i][player] > 0) return false;
  }
  return true;
}

// Check if a space is blocked by the opponent (2+ opponent pieces)
export function isBlocked(state: GameState, spaceIndex: number, player: Player): boolean {
  const opponent: Player = player === 'white' ? 'black' : 'white';
  return state.board[spaceIndex][opponent] >= 2;
}

// Check if landing on a space would hit an opponent's single piece
export function wouldHit(state: GameState, spaceIndex: number, player: Player): boolean {
  const opponent: Player = player === 'white' ? 'black' : 'white';
  return state.board[spaceIndex][opponent] === 1;
}

// Get the exit court position (1-6) for a space index (18-23)
export function exitPosition(spaceIndex: number): number {
  // FIXED: Board displays spaceIndex+1 to user
  // Formula: 25 - (spaceIndex + 1) = 24 - spaceIndex
  // Space 19 (index 18) needs 6, Space 24 (index 23) needs 1
  return 24 - spaceIndex;
}

// Get valid destinations for a piece at a given location
export function getValidMoves(
  state: GameState,
  from: number | 'well' | 'pit',
  player: Player,
  moves: number[]
): number[] {
  const validDestinations: number[] = [];
  const uniqueMoves = [...new Set(moves)];

  for (const die of uniqueMoves) {
    if (from === 'well' || from === 'pit') {
      // Entering: die value determines the space (1-6, so index 0-5)
      // Can enter if not blocked (2+ opponents) OR can hit a blot (1 opponent)
      const destIndex = die - 1;
      if (destIndex >= 0 && destIndex < 6 && (!isBlocked(state, destIndex, player) || wouldHit(state, destIndex, player))) {
        if (!validDestinations.includes(destIndex)) {
          validDestinations.push(destIndex);
        }
      }
    } else {
      // Normal movement: counter-clockwise = increasing index
      const destIndex = from + die;
      
      if (destIndex < TOTAL_SPACES) {
        // Normal move on board - can move if:
        // - Empty or own piece
        // - Can hit a blot (1 opponent piece)
        // - Cannot land on blocked space (2+ opponent pieces)
        if (!isBlocked(state, destIndex, player) || wouldHit(state, destIndex, player)) {
          if (!validDestinations.includes(destIndex)) {
            validDestinations.push(destIndex);
          }
        }
      }
      
      // BEARING OFF LOGIC (last quadrant)
      // die === position: can bear off OR move down (player's choice)
      // die < position: can only move down
      // die > position: no valid move
      if (from >= 18 && allInExitCourt(state, player)) {
        const pos = exitPosition(from); // Position 1-6
        // Exact match: bear off
        if (die === pos && !validDestinations.includes(-1)) {
          validDestinations.push(-1); // Bear off
        }
        // die < position: move down (only option)
        if (die < pos) {
          const newPos = pos - die;
          if (newPos >= 1) {
            const newSpaceIndex = newPos + 17;
            if (!isBlocked(state, newSpaceIndex, player)) {
              if (!validDestinations.includes(newSpaceIndex)) {
                validDestinations.push(newSpaceIndex);
              }
            }
          }
        }
        // die > position: NO move (can't bear off or move backward)
      }
    }
  }

  return validDestinations;
}


// Check if a player has ANY valid move with the remaining dice
export function hasAnyValidMove(state: GameState, player: Player, moves: number[]): boolean {
  if (moves.length === 0) return false;

  // Must move from pit first
  if (state.pit[player] > 0) {
    return getValidMoves(state, 'pit', player, moves).length > 0;
  }

  // Check well
  if (state.well[player] > 0) {
    if (getValidMoves(state, 'well', player, moves).length > 0) return true;
  }

  // Check each board space
  for (let i = 0; i < TOTAL_SPACES; i++) {
    if (state.board[i][player] > 0) {
      if (getValidMoves(state, i, player, moves).length > 0) return true;
    }
  }

  return false;
}

// Alias for hasAnyValidMove - easier to remember
export const canPlayerMove = hasAnyValidMove;

// Execute a move and return the new state
export function executeMove(
  state: GameState,
  from: number | 'well' | 'pit',
  to: number | 'off',
  dieUsed: number
): GameState {
  const player = state.currentPlayer;
  const opponent: Player = player === 'white' ? 'black' : 'white';
  
  // Deep clone the state
  const newState: GameState = JSON.parse(JSON.stringify(state));
  // Don't clone prevState references to avoid massive memory usage
  newState.turnMoves = state.turnMoves.map(m => ({ ...m, prevState: null }));
  
  let hitOpponent = false;

  // Remove piece from source
  if (from === 'well') {
    newState.well[player]--;
  } else if (from === 'pit') {
    newState.pit[player]--;
  } else {
    newState.board[from][player]--;
  }

  // Place piece at destination
  if (to === 'off') {
    newState.borneOff[player]++;
  } else {
    // Check for hit
    if (newState.board[to][opponent] === 1) {
      hitOpponent = true;
      newState.board[to][opponent] = 0;
      newState.pit[opponent]++;
    }
    newState.board[to][player]++;
  }

  // Remove used die from remaining moves
  const dieIndex = newState.remainingMoves.indexOf(dieUsed);
  if (dieIndex !== -1) {
    newState.remainingMoves.splice(dieIndex, 1);
  }

  // Record the move
  const move: SingleMove = {
    from, to, player, dieUsed, hitOpponent, prevState: null
  };
  newState.turnMoves = [...newState.turnMoves, move];

  // Clear selection
  newState.selectedSpace = null;
  newState.validMoves = [];

  // Update message
  if (hitOpponent) {
    newState.message = `${player === 'white' ? 'White' : 'Blue'} hits! Opponent piece sent to THE PIT!`;
  } else if (to === 'off') {
    newState.message = `${player === 'white' ? 'White' : 'Blue'} bears off a piece!`;
  } else {
    newState.message = `${player === 'white' ? 'White' : 'Blue'} moves.`;
  }

  // Check for win
  if (newState.borneOff[player] === PIECES_PER_PLAYER) {
    newState.winner = player;
    newState.phase = 'game-over';
    newState.message = `${player === 'white' ? 'White' : 'Blue'} wins! "Ya Neva' Give Up!"`;
    return newState;
  }

  // Handle doubles phases FIRST - before checking valid moves
  if (newState.doublesPhase === 'first' && isDoubles(newState.dice.values)) {
    const dieValue = newState.dice.values[0];
    const firstDoublesUsed = newState.turnMoves.filter(m => m.dieUsed === dieValue).length;
    
    if (firstDoublesUsed >= 4 || (allInExitCourt(newState, player) && newState.remainingMoves.length === 0)) {
      // All 4 first doubles used → go to complement
      const comp = getComplement(dieValue);
      newState.remainingMoves = [comp, comp, comp, comp];
      newState.doublesPhase = 'complement';
      newState.message = `Doubles! Now move 4 × ${comp} (complement).`;
      return newState;
    } else if (!hasAnyValidMove(newState, player, newState.remainingMoves)) {
      // No valid moves and can't use all 4 → lose everything
      newState.remainingMoves = [];
      newState.doublesPhase = null;
      endTurn(newState);
      return newState;
    }
  } else if (newState.doublesPhase === 'complement') {
    const dieValue = newState.dice.values[0];
    const comp = getComplement(dieValue);
    const compUsed = newState.turnMoves.filter(m => m.dieUsed === comp).length;
    
    if (compUsed >= 4 || (allInExitCourt(newState, player) && newState.remainingMoves.length === 0)) {
      // All complement used → get reroll
      newState.doublesPhase = 'reroll';
      newState.phase = 'rolling';
      newState.message = `All complement moves used! Roll again!`;
      return newState;
    } else if (!hasAnyValidMove(newState, player, newState.remainingMoves)) {
      // Can't use complement → lose re-roll
      newState.doublesPhase = null;
      endTurn(newState);
      return newState;
    }
  }

  // Check if more moves available (non-doubles path)
  if (newState.remainingMoves.length === 0 || !hasAnyValidMove(newState, player, newState.remainingMoves)) {
    newState.doublesPhase = null;
    endTurn(newState);
    return newState;
  }

  return newState;
}

function endTurn(state: GameState): void {
  const opponent: Player = state.currentPlayer === 'white' ? 'black' : 'white';
  // Save move history
  if (state.turnMoves.length > 0) {
    state.moveHistory = [
      ...state.moveHistory,
      {
        player: state.currentPlayer,
        dice: state.dice.values,
        moves: state.turnMoves.map(m => ({ ...m, prevState: null })),
      }
    ];
  }
  state.currentPlayer = opponent;
  state.phase = 'rolling';
  state.remainingMoves = [];
  state.turnMoves = [];
  state.doublesPhase = null;
  state.selectedSpace = null;
  state.validMoves = [];
  state.message = `${opponent === 'white' ? 'White' : 'Blue'}'s turn. Roll the dice!`;
}


// Process dice roll and set up remaining moves
export function processDiceRoll(state: GameState, dice: [number, number]): GameState {
  const newState: GameState = JSON.parse(JSON.stringify(state));
  newState.turnMoves = [];
  newState.dice = { values: dice, rolled: true };
  newState.phase = 'moving';

  if (isDoubles(dice)) {
    const dieValue = dice[0];
    const possibleMoves = countValidMoves(newState, newState.currentPlayer, [dieValue]);
    
    // In bearing-off zone: allow partial (rule breaks)
    if (allInExitCourt(newState, newState.currentPlayer)) {
      newState.remainingMoves = [dieValue, dieValue, dieValue, dieValue];
      newState.doublesPhase = 'first';
      newState.message = `Doubles ${dieValue}s in end zone! Move as many as possible.`;
    } else {
      // Outside bearing-off zone: must be able to use ALL 4 doubles
      if (possibleMoves >= 4) {
        newState.remainingMoves = [dieValue, dieValue, dieValue, dieValue];
        newState.doublesPhase = 'first';
        newState.message = `Doubles ${dieValue}s! Move 4 × ${dieValue}, then 4 × ${getComplement(dieValue)}, then roll again!`;
      } else {
        // Can't use all 4 - turn ends immediately
        newState.remainingMoves = [];
        newState.doublesPhase = null;
        newState.message = `Can't make all 4 doubles ${dieValue}s! Turn passes.`;
        endTurn(newState);
        newState.phase = 'rolling';
        return newState;
      }
    }
  } else {
    newState.remainingMoves = [dice[0], dice[1]];
    newState.doublesPhase = null;
    newState.message = `Rolled ${dice[0]} and ${dice[1]}. Make your moves!`;
  }

  // Check if any moves are possible
  if (!hasAnyValidMove(newState, newState.currentPlayer, newState.remainingMoves)) {
    newState.message = `No valid moves available. Turn passes.`;
    setTimeout(() => {}, 0); // Will handle in UI
    endTurn(newState);
    newState.phase = 'rolling';
  }

  return newState;
}

// Handle initial roll to determine who goes first
export function processInitialRoll(state: GameState): GameState {
  const newState: GameState = JSON.parse(JSON.stringify(state));
  let d1 = rollDie();
  let d2 = rollDie();
  
  // Re-roll ties
  while (d1 === d2) {
    d1 = rollDie();
    d2 = rollDie();
  }

  newState.dice = { values: [d1, d2], rolled: true };
  
  if (d1 > d2) {
    newState.currentPlayer = 'white';
    newState.message = `White rolls ${d1}, Blue rolls ${d2}. White goes first with ${d1} and ${d2}!`;
  } else {
    newState.currentPlayer = 'black';
    newState.message = `White rolls ${d1}, Blue rolls ${d2}. Blue goes first with ${d1} and ${d2}!`;
  }

  // The winner uses both numbers as their opening move
  newState.remainingMoves = [d1, d2];
  newState.phase = 'moving';
  newState.turnMoves = [];

  if (!hasAnyValidMove(newState, newState.currentPlayer, newState.remainingMoves)) {
    endTurn(newState);
    newState.phase = 'rolling';
  }

  return newState;
}

// Get the die value needed to move from 'from' to 'to'
export function getDieForMove(from: number | 'well' | 'pit', to: number | 'off'): number {
  if (from === 'well' || from === 'pit') {
    if (typeof to === 'number') return to + 1; // index 0 = space 1 = die value 1
    return 0;
  }
  if (to === 'off') {
    return exitPosition(from as number);
  }
  return (to as number) - (from as number);
}

// Count how many valid moves are possible with the dice
export function countValidMoves(state: GameState, player: Player, moves: number[]): number {
  let count = 0;
  // Must move from pit first
  if (state.pit[player] > 0) {
    count += getValidMoves(state, 'pit', player, moves).length;
  }
  // Check well
  if (state.well[player] > 0) {
    count += getValidMoves(state, 'well', player, moves).length;
  }
  // Check each board space
  for (let i = 0; i < TOTAL_SPACES; i++) {
    if (state.board[i][player] > 0) {
      count += getValidMoves(state, i, player, moves).length;
    }
  }
  return count;
}

export function forceEndTurn(state: GameState): GameState {
  const newState = { ...state };
  const opponent = state.currentPlayer === "white" ? "blue" : "white";
  newState.currentPlayer = opponent;
  newState.phase = "rolling";
  newState.remainingMoves = [];
  newState.doublesPhase = null;
  newState.message = "No valid moves - turn passes.";
  newState.aiThinking = false;
  return newState;
}
