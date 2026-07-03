/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean;
  // Card modifier effects
  frozen?: boolean;       // D Rank: Clumsy Move (cannot move next turn)
  halfRange?: boolean;    // D Rank: Heavy Armor (move half distance)
  fog?: boolean;          // D Rank: Fog (hidden from enemy until moved)
  shield?: boolean;       // C Rank: Shield (immune to capture for 1 turn)
  royalGuard?: boolean;   // A Rank: Royal Guard (moves like Queen for 1 turn)
}

export type Board = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece | null;
  promotion?: PieceType;
  cardUsed?: Card;
  notation: string;
}

export type CardRarity = 'D' | 'C' | 'B' | 'A' | 'S';
export type CardCategory = 'curse' | 'utility' | 'tactical' | 'power' | 'miracle';
export type TargetType = 
  | 'none' 
  | 'friendly_piece' 
  | 'enemy_piece' 
  | 'empty_square' 
  | 'two_friendly_pieces' 
  | 'captured_piece';

export interface Card {
  id: string;
  name: string;
  rarity: CardRarity;
  cost: number;
  description: string;
  flavorText: string;
  category: CardCategory;
  targetType: TargetType;
  effectCode: string;
  icon?: string;
  unlockedByDefault?: boolean;
}

export type GameMode = 'match' | 'deck_library' | 'shop' | 'oracle';
export type AILevel = 'easy' | 'medium' | 'hard' | 'pass_and_play';

export interface PlayerState {
  color: PieceColor;
  hand: Card[];
  deck: Card[];
  discard: Card[];
  energy: number;
  maxEnergy: number;
  capturedPieces: Piece[];
  timeWarpActive?: boolean;
  checkmateEscapeActive?: boolean;
}

export interface BoardSkin {
  id: string;
  name: string;
  lightSq: string;
  darkSq: string;
  border: string;
  highlight: string;
  targetHighlight: string;
  previewBg: string;
}

export interface GameHistorySnapshot {
  board: Board;
  turn: PieceColor;
  whiteState: PlayerState;
  blackState: PlayerState;
  lastMove?: Move;
}
