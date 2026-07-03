/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Piece } from '../types';
import { Snowflake, Shield, Crown, HelpCircle, ShieldAlert } from 'lucide-react';

interface ChessPieceProps {
  piece: Piece;
  isPlayerTurn: boolean;
  isSelected?: boolean;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ piece, isSelected }) => {
  // If shrouded in fog by enemy, render mystery question mark!
  if (piece.fog) {
    return (
      <div className={`relative flex items-center justify-center w-full h-full cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-110 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]' : 'hover:scale-105'}`}>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800/90 border-2 border-purple-500/50 flex items-center justify-center shadow-lg shadow-purple-500/20 animate-pulse">
          <HelpCircle className="w-6 h-6 text-purple-300" />
        </div>
      </div>
    );
  }

  // Classic Unicode Chess Symbols with modern styling
  const symbols: Record<string, string> = {
    'w-k': '♔', 'w-q': '♕', 'w-r': '♖', 'w-b': '♗', 'w-n': '♘', 'w-p': '♙',
    'b-k': '♚', 'b-q': '♛', 'b-r': '♜', 'b-b': '♝', 'b-n': '♞', 'b-p': '♟',
  };

  const symbol = symbols[`${piece.color}-${piece.type}`] || '?';
  const isWhite = piece.color === 'w';

  return (
    <div className={`relative flex items-center justify-center w-full h-full select-none cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-115 drop-shadow-[0_0_15px_rgba(245,158,11,0.9)] -translate-y-1' : 'hover:scale-108'}`}>
      {/* Piece character */}
      <span 
        className={`text-3xl sm:text-4xl md:text-5xl font-bold leading-none transition-colors ${
          isWhite 
            ? 'text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [text-shadow:_0_1px_0_rgb(255_255_255_/_40%),_0_2px_4px_rgb(0_0_0)]' 
            : 'text-slate-900 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] [text-shadow:_0_1px_1px_rgb(255_255_255_/_20%),_0_2px_8px_rgb(0_0_0)]'
        }`}
      >
        {symbol}
      </span>

      {/* Status effect badges */}
      <div className="absolute -top-1 -right-1 flex flex-col gap-0.5 z-10">
        {piece.shield && (
          <div className="bg-emerald-500/90 text-slate-950 p-1 rounded-full shadow-md shadow-emerald-500/50 border border-emerald-300 animate-bounce" title="Aegis Shield: Immune to capture for 1 turn">
            <Shield className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" />
          </div>
        )}
        {piece.frozen && (
          <div className="bg-cyan-500/90 text-slate-950 p-1 rounded-full shadow-md shadow-cyan-500/50 border border-cyan-200 animate-spin" title="Clumsy Move: Frozen for 1 turn">
            <Snowflake className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </div>
        )}
        {piece.royalGuard && (
          <div className="bg-amber-400 text-slate-950 p-1 rounded-full shadow-md shadow-amber-400/60 border border-amber-200 animate-pulse" title="Royal Guard: Has Queen movement powers this turn">
            <Crown className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" />
          </div>
        )}
        {piece.halfRange && (
          <div className="bg-slate-600 text-slate-200 p-1 rounded-full shadow-md border border-slate-400" title="Heavy Armor: Range halved this turn">
            <ShieldAlert className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
};
