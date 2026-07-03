/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card, PlayerState } from '../types';
import { RARITY_COLORS } from '../data/cards';
import { Sparkles, Zap, Shield, Eye, Clock, Crown, History, Sun, ShieldCheck, Snowflake, ShieldAlert, CloudFog, Move, RefreshCw, RotateCcw, Info } from 'lucide-react';

interface CardHandProps {
  playerState: PlayerState;
  isPlayerTurn: boolean;
  activeCard: Card | null;
  onUseCard: (card: Card) => void;
  onInspectCard: (card: Card) => void;
}

export const CardHand: React.FC<CardHandProps> = ({
  playerState,
  isPlayerTurn,
  activeCard,
  onUseCard,
  onInspectCard,
}) => {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Snowflake': return <Snowflake className="w-5 h-5 text-cyan-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-slate-400" />;
      case 'CloudFog': return <CloudFog className="w-5 h-5 text-purple-400" />;
      case 'Eye': return <Eye className="w-5 h-5 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-300" />;
      case 'Shield': return <Shield className="w-5 h-5 text-emerald-300" />;
      case 'Move': return <Move className="w-5 h-5 text-cyan-300" />;
      case 'RefreshCw': return <RefreshCw className="w-5 h-5 text-indigo-300" />;
      case 'RotateCcw': return <RotateCcw className="w-5 h-5 text-amber-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-purple-300" />;
      case 'Clock': return <Clock className="w-5 h-5 text-indigo-400" />;
      case 'Crown': return <Crown className="w-5 h-5 text-amber-400" />;
      case 'History': return <History className="w-5 h-5 text-amber-300" />;
      case 'Sun': return <Sun className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-3">
      
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="font-extrabold text-base md:text-lg text-slate-200 tracking-tight">
            YOUR ARCANUM DECK ({playerState.hand.length} / 5 Cards in Hand)
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Deck: {playerState.deck.length} remaining | Discard: {playerState.discard.length}
        </span>
      </div>

      {playerState.hand.length === 0 ? (
        <div className="w-full py-10 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center">
          <Sparkles className="w-8 h-8 text-slate-600 animate-pulse" />
          <p className="text-slate-400 font-bold">Your hand is empty!</p>
          <p className="text-xs text-slate-500">End turns or play Double Think to draw mystical cards.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {playerState.hand.map((card, idx) => {
            const styles = RARITY_COLORS[card.rarity] || RARITY_COLORS['D'];
            const isActive = activeCard?.id === card.id;
            const canAfford = playerState.energy >= card.cost;
            const canPlay = isPlayerTurn && canAfford && !isActive;

            return (
              <div
                key={`${card.id}-${idx}`}
                className={`relative flex flex-col justify-between p-3.5 rounded-2xl border-2 transition-all duration-200 select-none ${styles.bg} ${styles.border} ${styles.glow} ${
                  isActive
                    ? 'ring-4 ring-cyan-400 scale-105 -translate-y-2 shadow-2xl shadow-cyan-500/30'
                    : 'hover:-translate-y-1 hover:shadow-xl'
                }`}
              >
                {/* Rarity & Cost Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md shadow-sm ${styles.badge}`}>
                    {card.rarity}-RANK
                  </span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${
                    canAfford 
                      ? 'bg-indigo-900/80 text-cyan-200 border-indigo-400/40' 
                      : 'bg-red-950/80 text-red-300 border-red-500/40 animate-pulse'
                  }`}>
                    <Zap className="w-3 h-3 fill-current" />
                    <span>{card.cost}</span>
                  </div>
                </div>

                {/* Card Title & Icon */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 shadow-inner shrink-0">
                    {getIcon(card.icon)}
                  </div>
                  <h4 className="font-extrabold text-sm md:text-base text-slate-100 leading-tight">
                    {card.name}
                  </h4>
                </div>

                {/* Card Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3 flex-grow font-medium">
                  {card.description}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onInspectCard(card)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                    title="Inspect Lore"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onUseCard(card)}
                    disabled={!isPlayerTurn || !canAfford || isActive}
                    className={`flex-grow py-1.5 px-3 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-200 animate-pulse'
                        : canPlay
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {isActive ? 'TARGETING...' : canAfford ? 'USE CARD' : 'NO MANA'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
