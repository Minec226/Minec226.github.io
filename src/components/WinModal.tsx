/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { PieceColor } from '../types';
import confetti from 'canvas-confetti';
import { Crown, Coins, RefreshCcw, Swords, Award } from 'lucide-react';

interface WinModalProps {
  winner: PieceColor | 'draw';
  playerColor: PieceColor;
  coinsEarned: number;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  winner,
  playerColor,
  coinsEarned,
  onPlayAgain,
  onClose,
}) => {
  useEffect(() => {
    if (winner !== 'draw') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981'],
      });
    }
  }, [winner]);

  const isPlayerWinner = winner === playerColor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-4 border-amber-500/80 rounded-3xl p-8 text-center shadow-2xl shadow-amber-500/20 flex flex-col items-center gap-6 animate-scaleUp">
        
        {/* Crown Icon */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-purple-600 border-2 border-white/20 shadow-2xl shadow-amber-500/40">
          <Crown className="w-16 h-16 text-slate-950 fill-slate-950 animate-bounce" style={{ animationDuration: '2s' }} />
        </div>

        {/* Title */}
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-500/40">
            {winner === 'draw' ? 'Stalemate / Draw' : isPlayerWinner ? 'Glorious Victory' : 'Valiant Defeat'}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2 tracking-tight">
            {winner === 'draw' 
              ? "BATTLE DRAWN!" 
              : winner === 'w' 
              ? "WHITE WINS!" 
              : "BLACK WINS!"}
          </h2>
          <p className="text-sm text-slate-300 mt-1 font-medium">
            {winner === 'draw'
              ? "The battlefield grew silent without a sovereign falling."
              : isPlayerWinner
              ? "Your tactical spellcraft and chess mastery claimed the enemy throne!"
              : "The opponent's arcane strategies proved superior this time."}
          </p>
        </div>

        {/* Coins Earned Reward Box */}
        <div className="w-full bg-slate-900/90 border-2 border-amber-500/50 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-inner">
          <Coins className="w-8 h-8 text-amber-400 fill-amber-400 animate-pulse" />
          <div className="text-left">
            <span className="text-xs text-slate-400 font-bold uppercase block">Battle Reward</span>
            <span className="text-2xl font-black text-amber-200">+{coinsEarned} COINS</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all active:scale-95"
          >
            <RefreshCcw className="w-4 h-4 stroke-[3]" />
            <span>Play Again</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all"
          >
            Return to Library
          </button>
        </div>

      </div>
    </div>
  );
};
