/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board, Card, PieceColor, Position, PlayerState, PieceType } from '../types';
import { cloneBoard, isCheck } from './chessEngine';
import { drawRandomCard } from '../data/cards';

export interface CardPlayResult {
  newBoard: Board;
  newPlayerState: PlayerState;
  newOpponentState: PlayerState;
  message: string;
  success: boolean;
  scoutHighlights?: Position[];
  triggerUndo?: boolean;
}

export function applyCardEffect(
  card: Card,
  board: Board,
  playerColor: PieceColor,
  playerState: PlayerState,
  opponentState: PlayerState,
  target1?: Position,
  target2?: Position
): CardPlayResult {
  const newBoard = cloneBoard(board);
  const newPlayerState = { ...playerState, hand: [...playerState.hand], capturedPieces: [...playerState.capturedPieces] };
  const newOpponentState = { ...opponentState, hand: [...opponentState.hand] };

  // Check energy cost
  if (newPlayerState.energy < card.cost) {
    return {
      newBoard,
      newPlayerState,
      newOpponentState,
      message: `Not enough energy! Needs ${card.cost} mana.`,
      success: false,
    };
  }

  // Enforce negative cards (curses and enemy-targeting spells) can ONLY be cast on enemy pieces
  if (target1 && (card.targetType === 'enemy_piece' || card.category === 'curse')) {
    const targetPiece = newBoard[target1.row][target1.col];
    if (!targetPiece) {
      return {
        newBoard,
        newPlayerState,
        newOpponentState,
        message: `Must select an enemy piece for ${card.name}.`,
        success: false,
      };
    }
    if (targetPiece.color === playerColor) {
      return {
        newBoard,
        newPlayerState,
        newOpponentState,
        message: `❌ You can only use negative cards on the other player's pieces!`,
        success: false,
      };
    }
  }

  // Enforce friendly-targeting spells can ONLY be cast on player's own pieces
  if (target1 && card.targetType === 'friendly_piece') {
    const targetPiece = newBoard[target1.row][target1.col];
    if (!targetPiece) {
      return {
        newBoard,
        newPlayerState,
        newOpponentState,
        message: `Must select one of your own pieces for ${card.name}.`,
        success: false,
      };
    }
    if (targetPiece.color !== playerColor) {
      return {
        newBoard,
        newPlayerState,
        newOpponentState,
        message: `❌ You can only use ${card.name} on your own friendly pieces!`,
        success: false,
      };
    }
  }

  let message = `Cast ${card.name}! ${card.description}`;
  let scoutHighlights: Position[] | undefined = undefined;
  let triggerUndo = false;

  switch (card.effectCode) {
    case 'FREEZE_PIECE': {
      if (!target1 || !newBoard[target1.row][target1.col]) {
        return { newBoard, newPlayerState, newOpponentState, message: 'Must select an enemy piece to freeze.', success: false };
      }
      if (newBoard[target1.row][target1.col]!.color === playerColor) {
        return { newBoard, newPlayerState, newOpponentState, message: '❌ You can only use negative cards on the other player\'s pieces!', success: false };
      }
      newBoard[target1.row][target1.col]!.frozen = true;
      message = `Clumsy Move cast! Enemy ${newBoard[target1.row][target1.col]!.type.toUpperCase()} frozen for 1 turn!`;
      break;
    }
    case 'HALF_RANGE': {
      if (!target1 || !newBoard[target1.row][target1.col]) {
        return { newBoard, newPlayerState, newOpponentState, message: 'Must select an enemy piece to burden with heavy armor.', success: false };
      }
      if (newBoard[target1.row][target1.col]!.color === playerColor) {
        return { newBoard, newPlayerState, newOpponentState, message: '❌ You can only use negative cards on the other player\'s pieces!', success: false };
      }
      newBoard[target1.row][target1.col]!.halfRange = true;
      message = `Heavy Armor cast! Enemy piece's movement range halved!`;
      break;
    }
    case 'FOG_PIECE': {
      if (!target1 || !newBoard[target1.row][target1.col]) {
        return { newBoard, newPlayerState, newOpponentState, message: 'Must select an enemy piece to shroud in fog.', success: false };
      }
      if (newBoard[target1.row][target1.col]!.color === playerColor) {
        return { newBoard, newPlayerState, newOpponentState, message: '❌ You can only use negative cards on the other player\'s pieces!', success: false };
      }
      newBoard[target1.row][target1.col]!.fog = true;
      message = `Mystic Fog cast! Enemy piece shrouded in mist until it moves.`;
      break;
    }
    case 'SCOUT_THREATS': {
      if (!target1 || !newBoard[target1.row][target1.col]) {
        return { newBoard, newPlayerState, newOpponentState, message: 'Must select an enemy piece to scout.', success: false };
      }
      if (newBoard[target1.row][target1.col]!.color === playerColor) {
        return { newBoard, newPlayerState, newOpponentState, message: '❌ You can only scout the other player\'s pieces!', success: false };
      }
      // Calculate target highlights
      const p = newBoard[target1.row][target1.col]!;
      scoutHighlights = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const tp = newBoard[r][c];
          if (tp && tp.color === playerColor) {
            scoutHighlights.push({ row: r, col: c });
          }
        }
      }
      message = `Scout Vision cast! All potential targets revealed for ${p.type.toUpperCase()}.`;
      break;
    }
    case 'DRAW_TWO': {
      newPlayerState.hand.push(drawRandomCard());
      newPlayerState.hand.push(drawRandomCard());
      message = `Double Think cast! Drew 2 magical cards.`;
      break;
    }
    case 'SHIELD_PIECE': {
      if (!target1 || !newBoard[target1.row][target1.col]) {
        return { newBoard, newPlayerState, newOpponentState, message: 'Must select a friendly non-king piece to shield.', success: false };
      }
      if (newBoard[target1.row][target1.col]!.type === 'k') {
        return { newBoard, newPlayerState, newOpponentState, message: 'Cannot shield the King directly with this card.', success: false };
      }
      newBoard[target1.row][target1.col]!.shield = true;
      message = `Aegis Shield cast! Piece immune to capture for 1 turn.`;
      break;
    }
    case 'REPOSITION_PIECE': {
      if (!target1 || !target2 || !newBoard[target1.row][target1.col] || newBoard[target2.row][target2.col]) {
        return { newBoard, newPlayerState, newOpponentState, message: 'Select a friendly piece and an empty destination.', success: false };
      }
      const p = newBoard[target1.row][target1.col]!;
      if (p.type === 'k') {
        return { newBoard, newPlayerState, newOpponentState, message: 'Cannot reposition the King.', success: false };
      }
      newBoard[target2.row][target2.col] = p;
      newBoard[target1.row][target1.col] = null;
      message = `Tactical Reposition cast! Moved ${p.type.toUpperCase()} safely.`;
      break;
    }
    case 'SWAP_PIECES': {
      if (!target1 || !target2 || !newBoard[target1.row][target1.col] || !newBoard[target2.row][target2.col]) {
        return { newBoard, newPlayerState, newOpponentState, message: 'Must select two friendly non-king pieces to swap.', success: false };
      }
      const p1 = newBoard[target1.row][target1.col]!;
      const p2 = newBoard[target2.row][target2.col]!;
      if (p1.type === 'k' || p2.type === 'k') {
        return { newBoard, newPlayerState, newOpponentState, message: 'Cannot swap the King.', success: false };
      }
      newBoard[target1.row][target1.col] = p2;
      newBoard[target2.row][target2.col] = p1;
      message = `Spatial Swap cast! Swapped positions of two pieces instantly.`;
      break;
    }
    case 'RECALL_PAWN': {
      const pawnIndex = newPlayerState.capturedPieces.findIndex(p => p.type === 'p');
      if (pawnIndex === -1) {
        return { newBoard, newPlayerState, newOpponentState, message: 'No captured pawns available to recall.', success: false };
      }
      const startRow = playerColor === 'w' ? 6 : 1;
      let placed = false;
      for (let c = 0; c < 8; c++) {
        if (!newBoard[startRow][c]) {
          const revived = newPlayerState.capturedPieces.splice(pawnIndex, 1)[0];
          newBoard[startRow][c] = revived;
          placed = true;
          break;
        }
      }
      if (!placed) {
        return { newBoard, newPlayerState, newOpponentState, message: 'No empty starting squares available for pawn recall.', success: false };
      }
      message = `Recall cast! Pawn returned to the front lines.`;
      break;
    }
    case 'BLINK_TELEPORT': {
      if (!target1 || !target2 || !newBoard[target1.row][target1.col] || newBoard[target2.row][target2.col]) {
        return { newBoard, newPlayerState, newOpponentState, message: 'Select a non-king piece and any empty square to teleport.', success: false };
      }
      const p = newBoard[target1.row][target1.col]!;
      if (p.type === 'k') {
        return { newBoard, newPlayerState, newOpponentState, message: 'Cannot teleport the King.', success: false };
      }
      newBoard[target2.row][target2.col] = p;
      newBoard[target1.row][target1.col] = null;
      if (isCheck(newBoard, playerColor)) {
        return { newBoard: board, newPlayerState: playerState, newOpponentState: opponentState, message: 'Blink cannot place your own King in check!', success: false };
      }
      message = `Arcane Blink cast! Teleported ${p.type.toUpperCase()} across space!`;
      break;
    }
    case 'EXTRA_TURN': {
      newPlayerState.timeWarpActive = true;
      message = `Time Warp cast! Take two consecutive turns!`;
      break;
    }
    case 'QUEEN_MOVEMENT': {
      if (!target1 || !newBoard[target1.row][target1.col]) {
        return { newBoard, newPlayerState, newOpponentState, message: 'Select a piece to bless with Royal Guard.', success: false };
      }
      newBoard[target1.row][target1.col]!.royalGuard = true;
      message = `Royal Guard cast! Piece moves with Queen powers this turn!`;
      break;
    }
    case 'UNDO_TURN': {
      triggerUndo = true;
      message = `Fate Rewrite cast! Time reverts to before the last skirmish!`;
      break;
    }
    case 'REVIVE_ANY': {
      if (newPlayerState.capturedPieces.length === 0) {
        return { newBoard, newPlayerState, newOpponentState, message: 'No captured pieces in your graveyard to revive.', success: false };
      }
      if (!target1 || newBoard[target1.row][target1.col]) {
        return { newBoard, newPlayerState, newOpponentState, message: 'Select an empty square to revive your piece onto.', success: false };
      }
      // Revive strongest piece first (Queen -> Rook -> Bishop -> Knight -> Pawn)
      const priority: PieceType[] = ['q', 'r', 'b', 'n', 'p'];
      let chosenIdx = -1;
      for (const pt of priority) {
        chosenIdx = newPlayerState.capturedPieces.findIndex(p => p.type === pt);
        if (chosenIdx !== -1) break;
      }
      if (chosenIdx === -1) chosenIdx = 0;
      const revived = newPlayerState.capturedPieces.splice(chosenIdx, 1)[0];
      newBoard[target1.row][target1.col] = revived;
      message = `Divine Miracle cast! Revived ${revived.type.toUpperCase()} from the fallen!`;
      break;
    }
    case 'NEGATE_CHECKMATE': {
      newPlayerState.checkmateEscapeActive = true;
      message = `Checkmate Escape equipped! Your King will defy death once!`;
      break;
    }
  }

  // Deduct energy & remove card from hand
  newPlayerState.energy -= card.cost;
  const idx = newPlayerState.hand.findIndex(c => c.id === card.id);
  if (idx !== -1) {
    newPlayerState.discard.push(newPlayerState.hand.splice(idx, 1)[0]);
  }

  return {
    newBoard,
    newPlayerState,
    newOpponentState,
    message,
    success: true,
    scoutHighlights,
    triggerUndo,
  };
}
