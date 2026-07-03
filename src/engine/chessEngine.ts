/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board, Piece, PieceColor, PieceType, Position, Move, Card, PlayerState } from '../types';

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  const setupRow = (row: number, color: PieceColor) => {
    const types: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    for (let col = 0; col < 8; col++) {
      board[row][col] = {
        id: `${color}-${types[col]}-${col}`,
        type: types[col],
        color,
        hasMoved: false,
      };
    }
  };

  const setupPawns = (row: number, color: PieceColor) => {
    for (let col = 0; col < 8; col++) {
      board[row][col] = {
        id: `${color}-p-${col}`,
        type: 'p',
        color,
        hasMoved: false,
      };
    }
  };

  setupRow(0, 'b');
  setupPawns(1, 'b');
  setupPawns(6, 'w');
  setupRow(7, 'w');

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

export function findPiecePosition(board: Board, pieceId: string): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.id === pieceId) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

export function isCheck(board: Board, color: PieceColor): boolean {
  // Find King
  let kingPos: Position | null = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) {
        kingPos = { row: r, col: c };
        break;
      }
    }
  }
  if (!kingPos) return false;

  const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';
  // Check if any enemy can attack kingPos
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === enemyColor) {
        const rawMoves = getRawMoves(board, { row: r, col: c });
        if (rawMoves.some(m => m.row === kingPos!.row && m.col === kingPos!.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Calculate candidate moves without self-check filtering
 */
function getRawMoves(board: Board, from: Position): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];
  if (piece.frozen) return []; // Clumsy Move freeze

  const moves: Position[] = [];
  const color = piece.color;
  const forward = color === 'w' ? -1 : 1;
  const startRow = color === 'w' ? 6 : 1;

  // Use Queen movement if Royal Guard card is active!
  const effectiveType = piece.royalGuard ? 'q' : piece.type;

  const addMoveIfValid = (r: number, c: number): boolean => {
    if (r < 0 || r >= 8 || c < 0 || c >= 8) return false;
    const target = board[r][c];
    if (target) {
      if (target.color !== color) {
        // Can capture if not shielded (unless king)
        if (!target.shield || target.type === 'k') {
          moves.push({ row: r, col: c });
        }
      }
      return false; // Stop sliding
    }
    moves.push({ row: r, col: c });
    return true; // Continue sliding
  };

  const slide = (dr: number, dc: number) => {
    let r = from.row + dr;
    let c = from.col + dc;
    let step = 1;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      // Heavy Armor restriction: max 2 squares distance
      if (piece.halfRange && step > 2) break;
      if (!addMoveIfValid(r, c)) break;
      r += dr;
      c += dc;
      step++;
    }
  };

  switch (effectiveType) {
    case 'p': {
      // Forward move
      const r1 = from.row + forward;
      if (r1 >= 0 && r1 < 8 && !board[r1][from.col]) {
        moves.push({ row: r1, col: from.col });
        // Double move from start row
        const r2 = from.row + forward * 2;
        if (from.row === startRow && !board[r2][from.col]) {
          moves.push({ row: r2, col: from.col });
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        const c1 = from.col + dc;
        if (r1 >= 0 && r1 < 8 && c1 >= 0 && c1 < 8) {
          const target = board[r1][c1];
          if (target && target.color !== color && (!target.shield || target.type === 'k')) {
            moves.push({ row: r1, col: c1 });
          }
        }
      }
      break;
    }
    case 'n': {
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of knightOffsets) {
        addMoveIfValid(from.row + dr, from.col + dc);
      }
      break;
    }
    case 'b': {
      slide(-1, -1); slide(-1, 1); slide(1, -1); slide(1, 1);
      break;
    }
    case 'r': {
      slide(-1, 0); slide(1, 0); slide(0, -1); slide(0, 1);
      break;
    }
    case 'q': {
      slide(-1, -1); slide(-1, 1); slide(1, -1); slide(1, 1);
      slide(-1, 0); slide(1, 0); slide(0, -1); slide(0, 1);
      break;
    }
    case 'k': {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          addMoveIfValid(from.row + dr, from.col + dc);
        }
      }
      break;
    }
  }

  return moves;
}

/**
 * Get legal moves (filtering out moves that leave own King in check)
 */
export function getLegalMoves(board: Board, from: Position): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];
  const rawMoves = getRawMoves(board, from);

  return rawMoves.filter(to => {
    // Simulate move
    const tempBoard = cloneBoard(board);
    tempBoard[to.row][to.col] = { ...piece };
    tempBoard[from.row][from.col] = null;
    return !isCheck(tempBoard, piece.color);
  });
}

export function getAllLegalMovesForColor(board: Board, color: PieceColor): { from: Position; to: Position }[] {
  const allMoves: { from: Position; to: Position }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.color === color) {
        const moves = getLegalMoves(board, { row: r, col: c });
        for (const to of moves) {
          allMoves.push({ from: { row: r, col: c }, to });
        }
      }
    }
  }
  return allMoves;
}

export function isCheckmate(board: Board, color: PieceColor): boolean {
  if (!isCheck(board, color)) return false;
  const moves = getAllLegalMovesForColor(board, color);
  return moves.length === 0;
}

export function isStalemate(board: Board, color: PieceColor): boolean {
  if (isCheck(board, color)) return false;
  const moves = getAllLegalMovesForColor(board, color);
  return moves.length === 0;
}

/**
 * Execute standard move and clear temporary 1-turn status effects
 */
export function executeMove(
  board: Board, 
  from: Position, 
  to: Position, 
  promotion: PieceType = 'q'
): { newBoard: Board; captured: Piece | null; movedPiece: Piece } {
  const newBoard = cloneBoard(board);
  const piece = newBoard[from.row][from.col]!;
  const captured = newBoard[to.row][to.col];

  // Move piece
  newBoard[to.row][to.col] = {
    ...piece,
    hasMoved: true,
    // Handle pawn promotion
    type: piece.type === 'p' && (to.row === 0 || to.row === 7) ? promotion : piece.type,
    // Clear temporary 1-turn statuses upon moving
    royalGuard: false,
    halfRange: false,
    frozen: false,
    fog: false, // reveal fog on move
  };
  newBoard[from.row][from.col] = null;

  // Also clear temporary shields on opponent pieces after full turn cycle
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = newBoard[r][c];
      if (p && p.color === piece.color) {
        p.shield = false; // clear own old shield
      }
    }
  }

  return { newBoard, captured, movedPiece: newBoard[to.row][to.col]! };
}

/**
 * AI Opponent Move Selector
 */
export function getAIMove(
  board: Board, 
  aiColor: PieceColor, 
  aiState: PlayerState, 
  difficulty: 'easy' | 'medium' | 'hard' | 'pass_and_play' = 'medium'
): { move?: { from: Position; to: Position }; cardPlay?: { card: Card; target1?: Position; target2?: Position } } {
  const legalMoves = getAllLegalMovesForColor(board, aiColor);
  if (legalMoves.length === 0) return {};

  // Check if AI can play an impactful card
  const affordableCards = aiState.hand.filter(c => c.cost <= aiState.energy);
  
  if (affordableCards.length > 0 && Math.random() < (difficulty === 'hard' ? 0.6 : 0.3)) {
    // Try to play Miracle if AI has lost pieces
    const miracleCard = affordableCards.find(c => c.effectCode === 'REVIVE_ANY');
    if (miracleCard && aiState.capturedPieces.length > 0) {
      // Find empty back-row square
      const emptyRow = aiColor === 'b' ? 0 : 7;
      for (let c = 0; c < 8; c++) {
        if (!board[emptyRow][c]) {
          return { cardPlay: { card: miracleCard, target1: { row: emptyRow, col: c } } };
        }
      }
    }

    // Try Shield on King or Queen
    const shieldCard = affordableCards.find(c => c.effectCode === 'SHIELD_PIECE');
    if (shieldCard) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.color === aiColor && (p.type === 'q' || p.type === 'r') && !p.shield) {
            return { cardPlay: { card: shieldCard, target1: { row: r, col: c } } };
          }
        }
      }
    }

    // Try Double Think
    const drawCard = affordableCards.find(c => c.effectCode === 'DRAW_TWO');
    if (drawCard && aiState.hand.length < 5) {
      return { cardPlay: { card: drawCard } };
    }

    // Try Clumsy Move freeze on enemy Queen or Knight
    const freezeCard = affordableCards.find(c => c.effectCode === 'FREEZE_PIECE');
    if (freezeCard) {
      const enemyColor = aiColor === 'w' ? 'b' : 'w';
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.color === enemyColor && (p.type === 'q' || p.type === 'n') && !p.frozen) {
            return { cardPlay: { card: freezeCard, target1: { row: r, col: c } } };
          }
        }
      }
    }
  }

  // Otherwise, select standard move
  // Simple heuristic: capture highest value piece, or protect pieces
  const pieceValues: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
  
  let bestMove = legalMoves[0];
  let maxScore = -1000;

  for (const m of legalMoves) {
    let score = 0;
    const target = board[m.to.row][m.to.col];
    if (target) {
      score += pieceValues[target.type] * 10;
    }
    // Center control bonus
    if ((m.to.row === 3 || m.to.row === 4) && (m.to.col === 3 || m.to.col === 4)) {
      score += 2;
    }
    if (difficulty === 'easy') {
      score += (Math.random() * 10 - 5);
    }
    if (score > maxScore) {
      maxScore = score;
      bestMove = m;
    }
  }

  return { move: bestMove };
}
