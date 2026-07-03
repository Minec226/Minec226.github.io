/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameMode } from '../types';
import { Sparkles, ShoppingBag, Library, Swords, Coins, Wand2, RefreshCcw } from 'lucide-react';

interface NavbarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  coins: number;
  onNewGame: () => void;
  onOpenOracle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  coins,
  onNewGame,
  onOpenOracle,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 py-3 shadow-xl shadow-black/40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectMode('match')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              TACTICAL CARD CHESS
            </h1>
            <p className="text-xs text-slate-400 font-medium">Arcane Abilities & Strategic Mastery</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 md:gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onSelectMode('match')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              currentMode === 'match'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Play Match</span>
          </button>

          <button
            onClick={() => onSelectMode('deck_library')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              currentMode === 'deck_library'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>Deck & Library</span>
          </button>

          <button
            onClick={() => onSelectMode('shop')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              currentMode === 'shop'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Card Shop</span>
          </button>
        </nav>

        {/* Right Actions: Coins & Arcane Oracle & New Game */}
        <div className="flex items-center gap-3">
          {/* Coins Badge */}
          <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-lg shadow-amber-500/10">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-bold text-amber-200">{coins}</span>
          </div>

          {/* Arcane Oracle Coach Button */}
          <button
            onClick={onOpenOracle}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/40 text-purple-200 px-3.5 py-1.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Wand2 className="w-4 h-4 text-purple-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline">Arcane Oracle</span>
          </button>

          {/* Reset / New Game Button */}
          {currentMode === 'match' && (
            <button
              onClick={onNewGame}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
              title="Reset Match"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="hidden md:inline">New Game</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
