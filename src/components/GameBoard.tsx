/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Board, PieceColor, Position, Card, PlayerState, BoardSkin } from '../types';
import { ChessPiece } from './ChessPiece';
import { getLegalMoves } from '../engine/chessEngine';
import { Zap, ShieldAlert, History, User } from 'lucide-react';

interface GameBoardProps {
  board: Board;
  turn: PieceColor;
  playerColor: PieceColor;
  whiteState: PlayerState;
  blackState: PlayerState;
  selectedPos: Position | null;
  onSelectSquare: (pos: Position) => void;
  activeCard: Card | null;
  cardTarget1: Position | null;
  onSelectCardTarget: (pos: Position) => void;
  onCancelCard: () => void;
  skin: BoardSkin;
  isAIThinking: boolean;
  onUndo: () => void;
  canUndo: boolean;
  gameMessage: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  turn,
  playerColor,
  whiteState,
  blackState,
  selectedPos,
  onSelectSquare,
  activeCard,
  cardTarget1,
  onSelectCardTarget,
  onCancelCard,
  skin,
  isAIThinking,
  onUndo,
  canUndo,
  gameMessage,
}) => {
  // Determine legal moves for currently selected piece (when not in card targeting mode)
  const legalDestinations: Position[] = selectedPos && !activeCard 
    ? getLegalMoves(board, selectedPos) 
    : [];

  // Determine if a square is a valid target for the active card
  const isValidCardTarget = (r: number, c: number): boolean => {
    if (!activeCard) return false;
    const p = board[r][c];

    switch (activeCard.targetType) {
      case 'friendly_piece':
        return !!p && p.color === playerColor;
      case 'enemy_piece':
        return !!p && p.color !== playerColor;
      case 'empty_square':
        return !p;
      case 'two_friendly_pieces':
        return !!p && p.color === playerColor && p.type !== 'k';
      case 'captured_piece':
        return !p; // Place revived piece on empty square
      case 'none':
        return false;
    }
  };

  const renderSquare = (r: number, c: number) => {
    const p = board[r][c];
    const isLight = (r + c) % 2 === 0;
    const isSelected = selectedPos?.row === r && selectedPos?.col === c;
    const isLegalMove = legalDestinations.some(d => d.row === r && d.col === c);
    const isCardTarget = isValidCardTarget(r, c);
    const isFirstCardTarget = cardTarget1?.row === r && cardTarget1?.col === c;

    let bgClass = isLight ? skin.lightSq : skin.darkSq;
    let highlightClass = '';

    if (isSelected) {
      highlightClass = skin.highlight;
    } else if (isFirstCardTarget) {
      highlightClass = 'ring-4 ring-purple-500 bg-purple-500/40 animate-pulse';
    } else if (activeCard && isCardTarget) {
      highlightClass = skin.targetHighlight;
    }

    return (
      <div
        key={`${r}-${c}`}
        onClick={() => {
          if (activeCard) {
            if (isCardTarget) onSelectCardTarget({ row: r, col: c });
          } else {
            onSelectSquare({ row: r, col: c });
          }
        }}
        className={`relative aspect-square flex items-center justify-center transition-all duration-150 cursor-pointer ${bgClass} ${highlightClass}`}
      >
        {/* Square coordinate label on edge squares */}
        {c === 0 && (
          <span className="absolute top-1 left-1.5 text-[10px] md:text-xs font-mono opacity-60 select-none">
            {8 - r}
          </span>
        )}
        {r === 7 && (
          <span className="absolute bottom-1 right-1.5 text-[10px] md:text-xs font-mono uppercase opacity-60 select-none">
            {String.fromCharCode(97 + c)}
          </span>
        )}

        {/* Legal Move Dot or Capture Frame */}
        {isLegalMove && !p && (
          <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-emerald-400/80 shadow-md shadow-emerald-500/50 animate-ping" />
        )}
        {isLegalMove && p && (
          <div className="absolute inset-1 rounded-lg border-2 border-red-500 bg-red-500/20 animate-pulse pointer-events-none" />
        )}

        {/* Card Target Indicator */}
        {activeCard && isCardTarget && (
          <div className="absolute inset-1 rounded-lg border-2 border-cyan-400 bg-cyan-400/20 animate-pulse pointer-events-none flex items-center justify-center">
            <Zap className="w-4 h-4 text-cyan-200 animate-bounce opacity-80" />
          </div>
        )}

        {/* Chess Piece */}
        {p && (
          <ChessPiece
            piece={p}
            isPlayerTurn={turn === p.color}
            isSelected={isSelected || isFirstCardTarget}
          />
        )}
      </div>
    );
  };

  const renderEnergyBar = (state: PlayerState, label: string, isCurrent: boolean) => (
    <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
      isCurrent 
        ? 'bg-gradient-to-r from-indigo-950/90 to-purple-950/90 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
        : 'bg-slate-900/60 border-slate-800 opacity-80'
    }`}>
      <div className="flex items-center gap-2">
        <User className={`w-4 h-4 ${state.color === 'w' ? 'text-amber-200' : 'text-slate-400'}`} />
        <span className="font-bold text-sm text-slate-200">{label}</span>
        {state.timeWarpActive && (
          <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
            Time Warp (Bonus Turn!)
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-400 font-mono mr-1">MANA</span>
        {Array.from({ length: state.maxEnergy }).map((_, idx) => {
          const filled = idx < state.energy;
          return (
            <div
              key={idx}
              className={`w-3 h-5 md:w-3.5 md:h-6 rounded transition-all ${
                filled
                  ? 'bg-gradient-to-t from-cyan-500 to-indigo-400 shadow-sm shadow-cyan-400/50 ring-1 ring-cyan-200'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      
      {/* Top Banner: Turn status & Message */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-md">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${turn === 'w' ? 'bg-amber-400' : 'bg-slate-400'}`} />
          <span className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
            {isAIThinking ? "AI Opponent Pondering..." : `${turn === 'w' ? 'White' : 'Black'}'s Turn`}
          </span>
        </div>

        {gameMessage && (
          <div className="text-xs md:text-sm font-semibold text-amber-300 animate-fadeIn truncate max-w-[220px] sm:max-w-xs">
            ✨ {gameMessage}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo || isAIThinking}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              canUndo && !isAIThinking
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
            title="Undo Turn (Casual/Sandbox)"
          >
            <History className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      </div>

      {/* Opponent Energy Bar (Black if player is White, or vice versa) */}
      {renderEnergyBar(
        playerColor === 'w' ? blackState : whiteState,
        playerColor === 'w' ? 'Black (Opponent)' : 'White (Opponent)',
        turn !== playerColor
      )}

      {/* Active Card Targeting Banner */}
      {activeCard && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-cyan-900 border-2 border-cyan-400 p-3 rounded-xl shadow-xl shadow-cyan-500/20 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-300 animate-bounce" />
            <div>
              <p className="text-sm font-bold text-white">Targeting: {activeCard.name}</p>
              <p className="text-xs text-cyan-200">
                {cardTarget1 
                  ? "Select second target square to complete spell..." 
                  : "Click a glowing square on the board to cast!"}
              </p>
            </div>
          </div>
          <button
            onClick={onCancelCard}
            className="bg-black/60 hover:bg-black/80 text-white px-3 py-1 rounded-lg text-xs font-bold border border-white/20 transition-all"
          >
            Cancel Spell
          </button>
        </div>
      )}

      {/* 8x8 Chess Board Grid */}
      <div className={`${skin.border} transition-all`}>
        <div className="grid grid-cols-8 grid-rows-8 w-full rounded-xl overflow-hidden shadow-2xl border border-black/40">
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 8 }).map((_, c) => renderSquare(r, c))
          )}
        </div>
      </div>

      {/* Player Energy Bar */}
      {renderEnergyBar(
        playerColor === 'w' ? whiteState : blackState,
        playerColor === 'w' ? 'White (You)' : 'Black (You)',
        turn === playerColor
      )}

      {/* Captured Pieces Trays */}
      <div className="flex items-center justify-between gap-4 px-2 py-1 bg-slate-950/60 rounded-lg text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1">
          <span>Graveyard (White):</span>
          <div className="flex gap-0.5">
            {whiteState.capturedPieces.map((p, i) => (
              <span key={i} className="text-amber-200 font-bold text-sm">
                {p.type === 'p' ? '♟' : p.type === 'n' ? '♞' : p.type === 'b' ? '♝' : p.type === 'r' ? '♜' : '♛'}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span>Graveyard (Black):</span>
          <div className="flex gap-0.5">
            {blackState.capturedPieces.map((p, i) => (
              <span key={i} className="text-slate-400 font-bold text-sm">
                {p.type === 'p' ? '♟' : p.type === 'n' ? '♞' : p.type === 'b' ? '♝' : p.type === 'r' ? '♜' : '♛'}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
